from datetime import datetime
from uuid import uuid4

from app.user.user_enum import UserEntity
from app.user.user_model import Yasho_User, hash_password, Client, Employee
from app.user.user_view import EmployeeRegister
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

async def create_employee(create_req:EmployeeRegister):
    if not create_req.name or not create_req.email or not create_req.mobile or not create_req.password or not create_req.address or not create_req.photo or not create_req.id_proof or not create_req.sex or not create_req.dob:
        return "Please provide all required fields",401
    user = await Yasho_User.find_one({"mobile": create_req.mobile})
    if user:
        return "User already exists. Please login", 401
    user_id = "P"+str(uuid4().int)[:6]
    password = hash_password(create_req.password).decode("utf-8")
    user = Employee(
        user_id=user_id,
        name=create_req.name,
        email=create_req.email,
        mobile=create_req.mobile,
        password=password,
        address=create_req.address,
        dob = create_req.dob,
        sex = create_req.sex,
        photo = create_req.photo,
        id_proof = create_req.id_proof
    )
    await user.save()
    user = user.model_dump(exclude={"password","id"})
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
    users = await Yasho_User.find({"entity_type": {"$in": ["client", "pract"]}}).to_list()
    if not users:
        return "No users found",404
    users = [user.model_dump(exclude={"password", "id"}) for user in users]
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