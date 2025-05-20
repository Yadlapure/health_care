from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, SecretStr, Field

from app.app_bundle.auth.authorized_req_user import CurrentUserInfo, get_current_user
from app.user.user_enum import UserEntity
from app.user.user_model import Yasho_User
from app.user.user_service import generate_user_login, get_user, create_user, change_sub_merchant_password, get_all_users, update_role

user_router = APIRouter()


class UserLogin(BaseModel):
    mobile: str
    password: str

class Register(BaseModel):
    mobile: str
    password: str
    name:str
    email:str

class UserOut(Yasho_User):
    password: SecretStr = Field(..., exclude=True)
    id: SecretStr = Field(..., exclude=True)


class AllUserResponse(BaseModel):
    data:Optional[List[UserOut]]=[]
    status_code:int
    error:Optional[str]=""

@user_router.post("/register",response_model=AllUserResponse)
async def handler_user_register(create_req:Register):
    response,status_code = await create_user(
        name = create_req.name,
        email = create_req.email,
        mobile = create_req.mobile,
        password = create_req.password
    )
    if status_code == 0:
        return {"status_code": status_code, "data": response}
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
    if not user:
        return {"status_code":404,"data":"Invalid user"}
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


@user_router.get("/allUsers",response_model=AllUserResponse)
async def handler_get_all_users(
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await get_all_users()
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@user_router.get("/role-update")
async def handler_update_role(
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await update_role()
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}