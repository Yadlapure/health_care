from datetime import datetime, timedelta
from uuid import uuid4

import pytz
from fastapi import UploadFile, File

from app.app_bundle.env_config_settings import get_settings
from app.app_bundle.s3_utils import generate_pre_signed_urls, upload_to_s3
from app.user.user_enum import UserEntity
from app.user.user_service import get_user, get_client, get_employee
from app.visit.visit_model import Visit, VisitStatus, Details

IST = pytz.timezone("Asia/Kolkata")

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


async def assign(admin_id:str,client_id:str,emp_id:str, from_ts:datetime,to_ts:datetime,lat:str,lng:str):
    status = VisitStatus.initiated
    visit_id = "V" + str(uuid4().int)[:6]
    from_ts = from_ts.astimezone(IST)
    to_ts = to_ts.astimezone(IST)
    client = await get_client(client_id)
    employee = await get_employee(emp_id)
    location = {
        "lat":lat,
        "lng":lng
    }
    if not client or not employee or from_ts.date() < datetime.now().date():
        return {"message":"Incorrect Credentials"},401
    visit = await Visit.find_one({"assigned_client_id":client_id,"from_date":from_ts,"to_ts":to_ts})
    details = [{
        "daily_status": VisitStatus.initiated,
        "for_date": from_ts.date()
    }]
    if visit and visit.main_status.value == VisitStatus.cancelledVisit:
        visit.assigned_emp_id = emp_id
        visit.main_status = VisitStatus.initiated
        visit.assigned_admin_id = admin_id
        visit.location = location
        visit.details = details
        await visit.save()
    else :
        visit = Visit(assigned_admin_id=admin_id,assigned_client_id=client_id,assigned_emp_id=emp_id,main_status=status,visit_id=visit_id, from_ts=from_ts.date(),to_ts=to_ts.date(),location=location,details=details)
        await visit.save()

    return {
        "client_id":client.user_id,
        "client_name":client.name,
        "emp_id":employee.user_id,
        "emp_name":employee.name,
        "from_ts":from_ts.date(),
        "to_ts":to_ts.date()
    }, 0


async def check_in_out(
        visit_id:str,
        lat:str,
        lng:str,
        img:UploadFile = File(...)
):
    date = datetime.now(IST)
    tomorrow = date+timedelta(days=1)
    extension = img.filename.split(".")[-1]
    name = str(uuid4().int)[:10]
    imgname = name+"."+extension
    visit = await Visit.find_one({"visit_id":visit_id})
    if not visit:
        return "No visit assigned for today",0

    if visit.main_status.value == VisitStatus.initiated.value:
        for i in visit.details:
            if i.for_date.date() == date.date():
                if i.daily_status.value == VisitStatus.initiated.value:
                    check_in_object_name = upload_to_s3(img.file,f"checkin/{imgname}",get_settings().config_s3_bucket,extension)
                    if not check_in_object_name:
                        return "Error while uploading",403
                    i.checkIn.at = date
                    i.checkIn.lat = lat
                    i.checkIn.lng = lng
                    i.checkIn.img = check_in_object_name
                    i.daily_status = VisitStatus.checkedIn

                visit.main_status = VisitStatus.checkedIn
                await visit.save()
    elif visit.main_status.value == VisitStatus.checkedIn.value :
        for i in visit.details:
            if i.for_date.date() == date.date():
                if i.daily_status.value == VisitStatus.initiated.value:
                    check_in_object_name = upload_to_s3(img.file,f"checkin/{visit_id}/{date.date()}/{imgname}",get_settings().config_s3_bucket,extension)
                    if not check_in_object_name:
                        return "Error while uploading",403
                    i.checkIn.at = date
                    i.checkIn.lat = lat
                    i.checkIn.lng = lng
                    i.daily_status = VisitStatus.checkedIn
                    i.checkIn.img = check_in_object_name

                elif i.daily_status.value == VisitStatus.vitalUpdate.value:
                    if i.for_date.date() == visit.to_ts.date():
                        visit.main_status = VisitStatus.checkedOut
                    if not i.vitals.notes:
                        return "Provide vitals before checkout",0
                    check_out_object_name = upload_to_s3(img.file,f"checkout/{visit_id}/{date.date()}/{imgname}",get_settings().config_s3_bucket,extension)
                    if not check_out_object_name:
                        return "Error while uploading",403
                    i.checkOut.at = date
                    i.checkOut.lat = lat
                    i.checkOut.lng = lng
                    i.checkOut.img = check_out_object_name
                    i.daily_status = VisitStatus.checkedOut
                    if tomorrow.date() <= visit.to_ts.date():
                        obj = Details(**{
                            "daily_status": VisitStatus.initiated,
                            "for_date": tomorrow.date()
                        })
                        visit.details.append(obj)
                        break
                else:
                    return "Provide vitals before checkout",0
        await visit.save()
    else:
        return "Already checkedOut",0

    return "Success",0


async def update_vitals(visit_id,bloodPressure,sugar,notes):
    visit = await Visit.find_one({"visit_id":visit_id})
    if not visit or visit.main_status.value != VisitStatus.checkedIn.value:
        return "No visit assigned today",0
    if not notes:
        return "Provide notes",403
    today = datetime.now(IST)
    for i in visit.details:
        if i.for_date.date() == today.date():
            i.vitals.notes=notes
            i.vitals.sugar=sugar
            i.vitals.bloodPressure=bloodPressure
            i.daily_status = VisitStatus.vitalUpdate
    await visit.save()
    return "Vitals Updated Successfully", 0

async def get_visits(curr_user):
    if curr_user["entity_type"] == UserEntity.admin.value:
        visits =await Visit.find({"assigned_admin_id":curr_user["user_id"],"main_status": {"$ne": VisitStatus.cancelledVisit.value}}).to_list()
        if not visits:
            return "No visits available",403
        return visits,0

    if curr_user["entity_type"] == UserEntity.client.value:
        visits = await Visit.find({"assigned_client_id":curr_user["user_id"]}).to_list()
        if not visits:
            return "No visits available",403
        return visits,0


    if curr_user["entity_type"] == UserEntity.employee.value:
        visits = await Visit.find({"assigned_emp_id":curr_user["user_id"],"main_status": {"$ne": VisitStatus.cancelledVisit.value}}).to_list()
        if not visits:
            return "No visits assigned",403

        return visits,0


async def get_image_urls(object_names):
    response = []
    for object_name in object_names:
        get_url, put_url = generate_pre_signed_urls(get_settings().config_s3_bucket,object_name,"get")
        obj ={
            object_name:get_url
        }
        response.append(obj)
    return response,0

async def unassign(visit_id:str):
    today = datetime.now(IST)
    visit = await Visit.find_one({"visit_id": visit_id})
    if not visit:
        return "No visit has been assigned",403
    if visit.main_status.value == VisitStatus.initiated.value:
        visit.main_status = VisitStatus.cancelledVisit
    else:
        for i in visit.details:
            if i.for_date.date() == today.date():
                i.daily_status = VisitStatus.checkedOut
        visit.main_status = VisitStatus.checkedOut

    await visit.save()
    return "Unassigned successfully",0

async def extend(visit_id:str,to_ts:datetime):
    visit = await Visit.find_one({"visit_id": visit_id,"main_status": {"$ne": VisitStatus.cancelledVisit.value}})
    if not visit:
        return "Wrong visit to extend",403
    visit.to_ts = to_ts
    await visit.save()
    return "To date extended successfully", 0


async def create_missing_details_for_today():
    now_ist = datetime.now(IST)
    today = now_ist.date()
    tomorrow = today + timedelta(days=1)

    visits = await Visit.find({
        "main_status": VisitStatus.checkedIn,
        "to_ts": {"$gte": now_ist}
    }).to_list()

    for visit in visits:
        if not any(d.for_date.date() == tomorrow for d in visit.details):
            if visit.to_ts.date() >= tomorrow:
                visit.details.append(Details(
                    daily_status=VisitStatus.initiated,
                    for_date=tomorrow
                ))
                await visit.save()