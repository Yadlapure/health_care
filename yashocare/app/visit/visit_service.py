from datetime import datetime
from uuid import uuid4

import pytz
from fastapi import UploadFile, File

from app.app_bundle.env_config_settings import get_settings
from app.app_bundle.s3_utils import generate_pre_signed_urls, upload_to_s3
from app.user.user_enum import UserEntity
from app.user.user_service import get_user
from app.visit.visit_model import Visit, VisitStatus


# s3 = boto3.client(
#     "s3",
#     aws_access_key_id = "get",
#     aws_secret_access_key = "5MjHNKTLFCcxMpnue7qng0pMkNELZ3CDo7z2932V",
#     region_name = "ap-south-1"
# )
# bucket_name = "yasho-image"
# s3.create_bucket(
#     Bucket = bucket_name,
#     CreateBucketConfiguration = {'LocationConstraint':"ap-south-1"}
# )

# print(f"Created bucket {bucket_name}")


async def assign(admin_id:str,client_id:str,pract_id:str, date:datetime):
    status = VisitStatus.initiated
    visit_id = "V" + str(uuid4().int)[:6]

    client = await get_user(client_id)
    pract = await get_user(pract_id)
    if not client or not pract:
        return {"message":"Incorrect Credentials"},401

    visit = Visit(assigned_admin_id=admin_id,assigned_client_id=client_id,assigned_pract_id=pract_id,status=status,visit_id=visit_id, for_date=date.date())
    await visit.save()
    return "visit initiated", 0


async def check_in_out(
        pract_id:str,
        lat:str,
        lng:str,
        img:UploadFile = File(...)
):
    date = datetime.now(tz=pytz.UTC)
    extension = img.filename.split(".")[-1]
    name = str(uuid4().int)[:10]
    imgname = name+"."+extension
    visit = await Visit.find_one({"assigned_pract_id":pract_id,"status": {"$in": ["INITIATED", "CHECKEDIN", "VITALUPDATE"]},"for_date":date.date()})
    if not visit:
        return "No visit assigned today",0
    if visit.status.value == VisitStatus.initiated.value:
        check_in_object_name = upload_to_s3(img.file,f"checkin/{imgname}",get_settings().config_s3_bucket,extension)
        if not check_in_object_name:
            return "Error while uploading",403
        visit.checkIn.at = date
        visit.checkIn.lat = lat
        visit.checkIn.lng = lng
        visit.checkIn.img = check_in_object_name
        visit.status = VisitStatus.checkedIn
        await visit.save()
    elif visit.status.value == VisitStatus.vitalUpdate.value :
        if not visit.vitals.notes:
            return "Provide vitals before checkout",0
        check_out_object_name = upload_to_s3(img.file,f"checkout/{imgname}",get_settings().config_s3_bucket,extension)
        if not check_out_object_name:
            return "Error while uploading",403
        visit.checkOut.at = date
        visit.checkOut.lat = lat
        visit.checkOut.lng = lng
        visit.checkOut.img = check_out_object_name
        visit.status = VisitStatus.checkedOut
        await visit.save()
    else:
        return "No visit assigned today",0
    assigned_client = await get_user(visit.assigned_client_id)

    obj = {
        "visit_id": visit.visit_id,
        "assigned_client":assigned_client.name,
        "checkIn": visit.checkIn.at,
        "checkOut": visit.checkOut.at,
        "status":visit.status,
        "for_date":visit.for_date
    }
    return obj,0


async def update_vitals(pract_id,bloodPressure,sugar,notes,prescription_images):
    visit = await Visit.find_one({"assigned_pract_id":pract_id,"status":VisitStatus.checkedIn.value})
    if not visit or visit.status.value != VisitStatus.checkedIn.value:
        return "No visit assigned today",0
    if not notes:
        return "Provide notes",403
    if prescription_images:
        for img in prescription_images:
            extension = img.filename.split(".")[-1]
            name = str(uuid4().int)[:10]
            imgname = name+"."+extension
            vitals_object_name = upload_to_s3(img.file,f"vitals/{imgname}",get_settings().config_s3_bucket,extension)
            if not vitals_object_name:
                return "Error while uploading",403
            visit.vitals.prescription_images.append(vitals_object_name)
    visit.vitals.notes=notes
    visit.vitals.sugar=sugar
    visit.vitals.bloodPressure=bloodPressure
    visit.status = VisitStatus.vitalUpdate
    await visit.save()
    return "Vitals Updated Successfully", 0

async def get_visits(curr_user):
    if curr_user["entity_type"] == UserEntity.admin.value:
        visits =await Visit.find({"assigned_admin_id":curr_user["user_id"]}).to_list()
        if not visits:
            return "No visits available",0
        return visits,0

    visitsArray = []
    if curr_user["entity_type"] == UserEntity.client.value:
        visits = await Visit.find({"assigned_client_id":curr_user["user_id"]}).to_list()
        if not visits:
            return "No visits available",0
        for i in visits:
            visited_pract = await get_user(i.assigned_pract_id)
            obj = {
                "vitals": i.vitals,
                "checkIn": i.checkIn.at,
                "checkOut": i.checkOut.at,
                "visit_id": i.visit_id,
                "assigned_pract":visited_pract.name,
                "status":i.status
            }
            visitsArray.append(obj)

    if curr_user["entity_type"] == UserEntity.pract.value:
        visits = await Visit.find({"assigned_pract_id":curr_user["user_id"],"status":VisitStatus.initiated.value,"for_date":datetime.now(tz=pytz.UTC).date()}).to_list()
        if not visits:
            return "No visits assigned",0
        for i in visits:
            assigned_client = await get_user(i.assigned_client_id)
            obj = {
                "visit_id": i.visit_id,
                "checkIn": i.checkIn.at,
                "checkOut": i.checkOut.at,
                "assigned_client":assigned_client.name,
                "status":i.status,
                "for_date":i.for_date
            }
            visitsArray.append(obj)

    return visitsArray,0


async def get_image_urls(object_names):
    response = []
    for object_name in object_names:
        get_url, put_url = generate_pre_signed_urls(get_settings().config_s3_bucket,object_name,"get")
        obj ={
            object_name:get_url
        }
        response.append(obj)
    return response,0