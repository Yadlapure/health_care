from uuid import uuid4
from app.user.user_model import Yasho_User, hash_password


async def get_user(user_id:str):
    return await Yasho_User.find_one({"user_id":user_id})

async def create_user(
        name,email,mobile,password
):
    if not name or not email or not mobile or not password:
        return {"message":"Please provide all required fields"},401
    user = await Yasho_User.find_one({"mobile": mobile})
    if user:
        return {"message":"User already exists. Please login"}, 401
    user_id = "C"+str(uuid4().int)[:6]
    password = hash_password(password).decode("utf-8")
    user = Yasho_User(user_id=user_id,name=name,email=email,mobile=mobile,password=password)
    await user.save()
    return user,0

async def generate_user_login(mobile: str, password: str):
    mobile = str(mobile.replace(" ", "").lower())
    password = str(password.replace(" ", ""))
    user = await Yasho_User.find_one({"mobile":mobile})
    if not user or not user.check_password(password=password):
        return {"message": "Not Found"}, 404
    return {"token": user.token(entity_type=user.entity_type)}, 0


async def change_sub_merchant_password(user_id,new_password):
    pass
