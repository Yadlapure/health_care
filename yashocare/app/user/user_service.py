from datetime import datetime
from uuid import uuid4

from app.app_bundle.env_config_settings import get_settings
from app.app_bundle.s3_utils import upload_to_s3
from app.user.user_enum import UserEntity
from app.user.user_model import Yasho_User, hash_password, Client, Employee
from app.visit.visit_model import Visit, VisitStatus


async def get_user(user_id:str):
    return await Yasho_User.find_one({"user_id":user_id})

async def create_client(
        name,email,mobile,password, address, location
):
    if not name or not email or not mobile or not password or not address:
        return "Please provide all required fields",401
    user = await Yasho_User.find_one({"mobile": mobile})
    if user:
        return "User already exists. Please login", 401
    user_id = "C"+str(uuid4().int)[:6]
    password = hash_password(password).decode("utf-8")
    user = Client(user_id=user_id,name=name,email=email,mobile=mobile,password=password,address=address,location=location)
    await user.save()
    user = user.model_dump(exclude={"password","id"})
    return user,0

async def create_employee(
        name, email, mobile, address, sex, dob, guard_name, guard_mobile, id_proof, profile
):
    if not name or not email or not mobile or not address or not profile or not id_proof or not sex or not dob or not guard_name or not guard_mobile:
        return "Please provide all required fields",401
    user = await Yasho_User.find_one({"mobile": mobile})
    if user:
        return "User already exists. Please login", 401
    user_id = "P"+str(uuid4().int)[:6]
    # password = hash_password(password).decode("utf-8")
    id_proofs=[]
    for img in id_proof:
        extension = img.filename.split(".")[-1]
        id_name = str(uuid4().int)[:10]
        imgname = id_name+"."+extension
        object_name = upload_to_s3(img.file,f"id_proof/{user_id}/{imgname}",get_settings().config_s3_bucket,extension)
        if not object_name:
            return "Error while uploading id_proofs",403
        id_proofs.append(object_name)
    extension = profile.filename.split(".")[-1]
    profileImageName = str(uuid4().int)[:10]
    imgname = profileImageName+"."+extension
    profile_name = upload_to_s3(profile.file,f"profile/{user_id}/{imgname}",get_settings().config_s3_bucket,extension)
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


async def change_sub_merchant_password(user_id,new_password):
    pass

async def get_all_users():
    users = await Yasho_User.find({"entity_type": {"$in": ["client", "employee"]}}).to_list()
    if not users:
        return "No users found",404
    users = [user.model_dump(exclude={"id"}) for user in users]
    return users,0


async def update_role(user_id, entity):
    user = await  get_user(user_id)
    if not user:
        return "User not found",404
    if entity in UserEntity.__members__:
        if entity == UserEntity.client.value:
            user.entity_type = UserEntity.client
            changed_id = user_id.split("P")
            final_id = "C"+changed_id[1]
            user.user_id=final_id
        if entity == UserEntity.pract.value:
            user.entity_type = UserEntity.pract
            changed_id = user_id.split("C")
            final_id = "P"+changed_id[1]
            user.user_id=final_id
        await user.save()
        return "Role updated successfully",0
    return "Entity type doesn't exist",404


async def deactivate(user_id):
    user = await  get_user(user_id)
    if not user:
        return "User not found",404
    await user.delete()
    return "User deactivated successfully",0