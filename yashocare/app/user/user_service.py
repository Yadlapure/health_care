from datetime import datetime, timedelta
from uuid import uuid4
import pytz

from app.app_bundle.env_config_settings import get_settings
from app.app_bundle.s3_utils import upload_to_s3
from app.user.user_model import Yasho_User, Client, Employee
from app.visit.visit_model import Visit, VisitStatus


ist = pytz.timezone('Asia/Kolkata')


async def get_user(user_id:str):
    return await Yasho_User.find_one({"user_id":user_id})

async def get_client(user_id:str):
    return await Client.find_one({"user_id":user_id})

async def get_employee(user_id:str):
    return await Employee.find_one({"user_id":user_id})

async def create_client(
        name,email,mobile, address
):
    if not name or not email or not mobile or not address:
        return "Please provide all required fields",401
    user = await Yasho_User.find_one({"mobile": mobile})
    if user:
        return "User already exists. Please login", 401
    user_id = "C"+str(uuid4().int)[:6]
    # password = hash_password(password).decode("utf-8")
    user = Client(user_id=user_id,name=name,email=email,mobile=mobile,address=address)
    await user.save()
    user = user.model_dump(exclude={"id"})
    return user,0

async def create_employee(
        name, email, mobile, address, sex, dob, guard_name, guard_mobile, id_proof, profile
):
    if not any([name,email,mobile,address,profile,id_proof,sex,dob,guard_name,guard_mobile]):
        return "Please provide all required fields",401
    user = await Yasho_User.find_one({"mobile": mobile})
    if user:
        return "User already exists. Please login", 401
    user_id = "E"+str(uuid4().int)[:6]
    id_proofs=[]
    for img in id_proof:
        extension = img.filename.split(".")[-1]
        id_name = str(uuid4().int)[:10]
        imgname = id_name+"."+extension
        object_name = upload_to_s3(img.file,f"yashocare/id_proof/client/{user_id}/{imgname}",get_settings().config_s3_bucket,extension)
        if not object_name:
            return "Error while uploading id_proofs",403
        id_proofs.append(object_name)
    extension = profile.filename.split(".")[-1]
    profileImageName = str(uuid4().int)[:10]
    imgname = profileImageName+"."+extension
    profile_name = upload_to_s3(profile.file,f"yashocare/profile/{user_id}/{imgname}",get_settings().config_s3_bucket,extension)
    user = Employee(
        user_id=user_id,
        name=name,
        email=email,
        mobile=mobile,
        address=address,
        dob = dob,
        sex = sex,
        guard_name=guard_name,
        guard_mobile=guard_mobile,
        profie_photo = profile_name,
        id_proof = id_proofs
    )
    await user.save()
    user = user.model_dump(exclude={"id"})
    return user,0

async def generate_user_login(mobile: str, password: str):
    mobile = str(mobile.replace(" ", "").lower())
    password = str(password.replace(" ", ""))
    user = await Yasho_User.find_one({"mobile":mobile})
    if not user:
        return "User Not Found, Please Register!!", 404
    if not user.check_password(password=password):
        return "Invalid password!!", 403
    return {"token": user.token(entity_type=user.entity_type)}, 0


async def get_all_users():
    clients = await Client.find({"entity_type":"client","is_active":True}).to_list()
    employees = await Employee.find({"entity_type":"employee","is_active":True}).to_list()
    users = clients + employees
    if not users:
        return "No users found",404
    users = [user.model_dump(exclude={"id"}) for user in users]
    return users,0


async def deactivate(user_id):
    user = await  get_user(user_id)
    if not user:
        return "User not found",404
    await user.delete()
    return "User deactivated successfully",0


async def get_attendance(user_id, start: datetime, end: datetime):
    today = datetime.now(tz=pytz.UTC).date()
    start = ist.localize(start).astimezone(pytz.UTC)
    end = ist.localize(end).astimezone(pytz.UTC)
    visits = await Visit.find({
        "assigned_emp_id": user_id,
        "from_ts": {"$lte": end},
        "to_ts": {"$gte": start}
    }).to_list()

    if not visits:
        return "No visits available for this range", 0

    attendance = {}

    for visit in visits:
        from_date = visit.from_ts.date()
        to_date = min(visit.to_ts.date(), today)

        if from_date > to_date:
            continue

        total_days = (to_date - from_date).days + 1

        for i in range(total_days):
            curr_date = from_date + timedelta(days=i)
            status = "absent"
            check_in = None
            check_out = None

            for detail in visit.details:
                if detail.for_date.date() == curr_date:
                    if detail.daily_status.value == VisitStatus.checkedOut.value:
                        status = "present"
                        check_in = detail.checkIn.at if detail.checkIn else None
                        check_out = detail.checkOut.at if detail.checkOut else None
                        break
                    elif detail.daily_status.value in [VisitStatus.checkedIn.value, VisitStatus.vitalUpdate.value]:
                        status = "half_day"
                        check_in = detail.checkIn.at if detail.checkIn else None
                        break

            attendance[curr_date] = {
                "status": status,
                "check_in_time": check_in if status in ["half_day", "present"] else None,
                "check_out_time": check_out if status == "present" else None
            }

    return attendance, 0
