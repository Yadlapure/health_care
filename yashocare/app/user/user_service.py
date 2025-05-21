from uuid import uuid4

from app.user.user_enum import UserEntity
from app.user.user_model import Yasho_User, hash_password


async def get_user(user_id:str):
    return await Yasho_User.find_one({"user_id":user_id})

async def create_user(
        name,email,mobile,password
):
    if not name or not email or not mobile or not password:
        return "Please provide all required fields",401
    user = await Yasho_User.find_one({"mobile": mobile})
    if user:
        return "User already exists. Please login", 401
    user_id = "C"+str(uuid4().int)[:6]
    password = hash_password(password).decode("utf-8")
    user = Yasho_User(user_id=user_id,name=name,email=email,mobile=mobile,password=password)
    await user.save()
    return [user],0

async def generate_user_login(mobile: str, password: str):
    mobile = str(mobile.replace(" ", "").lower())
    password = str(password.replace(" ", ""))
    user = await Yasho_User.find_one({"mobile":mobile})
    if not user or not user.check_password(password=password):
        return "User Not Found, Please Register!!", 404
    return {"token": user.token(entity_type=user.entity_type)}, 0


async def change_sub_merchant_password(user_id,new_password):
    pass

async def get_all_users():
    users = await Yasho_User.find({"entity_type": {"$in": ["client", "pract"]}}).to_list()
    users = [user.model_dump(exclude={"password","id"}) for user in users]
    if not users:
        return "No users found",400
    return users,0


async def update_role(user_id, entity):
    user = await  get_user(user_id)
    if not user:
        return "User not found",404
    if entity in UserEntity:
        user.entity_type = entity
        if entity == UserEntity.client.value:
            changed_id = user_id.split("P")
            final_id = "C"+changed_id[1]
            user.user_id=final_id
        if entity == UserEntity.pract.value:
            changed_id = user_id.split("C")
            final_id = "P"+changed_id[1]
            user.user_id=final_id
        await user.save()
        return "Role updated successfully",0
    return "Entity type doesn't exist",404
