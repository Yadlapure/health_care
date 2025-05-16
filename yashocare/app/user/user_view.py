from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.app_bundle.auth.authorized_req_user import CurrentUserInfo, get_current_user
from app.user.user_service import generate_user_login, get_user, create_user, change_sub_merchant_password

user_router = APIRouter()


class UserLogin(BaseModel):
    mobile: str
    password: str

class Register(BaseModel):
    mobile: str
    password: str
    name:str
    email:str

@user_router.post("/register")
async def handler_user_register(create_req:Register):
    response,status_code = await create_user(
        name = create_req.name,
        email = create_req.email,
        mobile = create_req.mobile,
        password = create_req.password
    )
    if status_code == 0:
        return {"status_code": status_code, "data": response, "message":"User created successfully"}
    return {"status_code": status_code, "error": response}


@user_router.post("/login")
async def user_login(
        login_req: UserLogin,
):
    response, status_code = await generate_user_login(
        mobile=login_req.mobile,
        password=login_req.password,
    )
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


class ResetSubMerchantPassword(BaseModel):
    new_password: str


@user_router.post("/reset-password/{sub_merchant_id}")
async def bull_shit_login(
        change_password: ResetSubMerchantPassword,
        curr_user: CurrentUserInfo
):
    response, status_code = await change_sub_merchant_password(
        user_id = curr_user.user_id,
        new_password=change_password.new_password,
    )
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}



@user_router.get("/me")
async def handler_get_me_detail(
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    user_id = curr_user["user_id"]
    user = await get_user(user_id=user_id)
    return {
        "status_code": 0,
        "data": {
            "profile": {
                "email": user.email,
                "name": user.name,
                "mobile": user.mobile,
                "user_id": user.user_id,
                "entity_type": user.entity_type
            },
        },
    }
