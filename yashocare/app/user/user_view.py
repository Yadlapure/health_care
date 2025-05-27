from datetime import datetime
from typing import Optional, Literal, Annotated, List

from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel

from app.app_bundle.auth.authorized_req_user import CurrentUserInfo, get_current_user
from app.user.user_enum import UserEntity
from app.user.user_service import (
    generate_user_login,
    get_user,
    create_client,
    create_employee,
    get_all_users,
    deactivate,
    get_attendance, get_employee,
    update_reason,
    client_id_proof
)

user_router = APIRouter()


class UserLogin(BaseModel):
    mobile: str
    password: str

class ClientRegister(BaseModel):
    mobile: str
    name:str
    email:str
    address: str


class RoleUpdate(BaseModel):
    user_id:str
    entity:str


class Attendance(BaseModel):
    user_id:str
    from_ts:datetime
    to_ts:datetime


class Update(BaseModel):
    reason:str
    date:datetime


class ClientIdProof(BaseModel):
    user_id:str

@user_router.post("/register")
async def handler_user_register(create_req:ClientRegister):
    response,status_code = await create_client(
        name = create_req.name,
        email = create_req.email,
        mobile = create_req.mobile,
        address = create_req.address,
    )
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}

@user_router.post("/employee-register")
async def handler_user_register(
        id_proof:Annotated[List[UploadFile], File()],name:str= Form(...),email:str = Form(...),mobile:str=Form(...),address:str=Form(...),sex:Literal["male","female"]=Form(...),dob:str=Form(...),guard_name:str=Form(...),guard_mobile:str=Form(...),
        photo : UploadFile = File(...),
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response,status_code = await create_employee(
        name=name,
        email=email,
        mobile=mobile,
        address=address,
        sex=sex,dob=dob,
        guard_name=guard_name,
        guard_mobile=guard_mobile,
        id_proof=id_proof,
        profile=photo
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


@user_router.get("/me")
async def handler_get_me_detail(
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    user_id = curr_user["user_id"]
    if curr_user["entity_type"] == "employee":
        user = await get_employee(user_id=user_id)
    else:
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
                "entity_type": user.entity_type,
                "photo":user.profie_photo if curr_user["entity_type"]== "employee" else None
            },
        },
    }


@user_router.get("/allUsers")
async def handler_get_all_users(
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await get_all_users()
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@user_router.post("/client-id-proof")
async def handler_add_client_id_proof(
        id_proof:Annotated[List[UploadFile], File()],
        user_id:str=Form(...),
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await client_id_proof(user_id=user_id,id_proof=id_proof)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@user_router.delete("/deactivate")
async def handler_deactivate(
        user_id,
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await deactivate(user_id)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@user_router.post("/attendance")
async def handler_get_attendance(
        att_req:Attendance,
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    if curr_user["entity_type"] == UserEntity.client.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await get_attendance(user_id=att_req.user_id,start=att_req.from_ts,end=att_req.to_ts)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@user_router.post("/update-reason")
async def handler_update_reason(
        reason_req: Update,
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] != UserEntity.employee.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await update_reason(user_id=curr_user["user_id"],date=reason_req.date,reason=reason_req.reason)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}