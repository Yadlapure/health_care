from datetime import datetime
from typing import List, Annotated, Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel

from app.app_bundle.auth.authorized_req_user import CurrentUserInfo, get_current_user
from app.user.user_enum import UserEntity
# from app.user.user_service import generate_user_login, get_user, create_user, change_sub_merchant_password
from app.visit.visit_service import assign,check_in_out, update_vitals, get_visits, get_image_urls, unassign

visit_router = APIRouter()

class Assign(BaseModel):
    empId:str
    clientId:str
    from_ts:datetime
    to_ts:datetime

class Unassign(BaseModel):
    clientId:str
    date:datetime

@visit_router.post("/assign")
async def handler_assign(
        assign_req:Assign,
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await assign(admin_id=curr_user["user_id"],client_id=assign_req.clientId,emp_id=assign_req.empId,from_ts=assign_req.from_ts,to_ts=assign_req.to_ts)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@visit_router.post("/checkInOut")
async def handler_check_in_out(
        lat : str =Form(...),lng : str=Form(...),img : UploadFile = File(...),
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] != UserEntity.employee.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await check_in_out(pract_id = curr_user["user_id"],lat = lat,lng = lng, img = img)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}

@visit_router.post("/update-vitals")
async def handler_update_vitals(
        notes:str= Form(...),prescription_images:Annotated[Optional[List[UploadFile]], File()] = [],bloodPressure:str= Form(""),sugar:str= Form(""),
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] != UserEntity.pract.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await update_vitals(
        pract_id = curr_user["user_id"],
        bloodPressure=bloodPressure,
        sugar = sugar,
        notes = notes,
        prescription_images = prescription_images
    )
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}

@visit_router.get("/get-visits")
async def handler_get_visits(
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    response, status_code = await get_visits(curr_user)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}


@visit_router.post("/get-image-url")
async def handler_get_presigned_urls(
        object_names:List[str],
        curr_user: CurrentUserInfo = Depends(get_current_user)
):
    if curr_user["entity_type"] == UserEntity.pract.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await get_image_urls(object_names)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}

@visit_router.post("/unassign")
async def handler_unassign(
        unassign_req: Unassign,
        curr_user: CurrentUserInfo = Depends(get_current_user),
):
    if curr_user["entity_type"] != UserEntity.admin.value:
        return {"error":"Not Authorized","status_code":401}
    response, status_code = await unassign(client_id=unassign_req.clientId,date=unassign_req.date)
    if status_code == 0:
        return {"status_code": status_code, "data": response}
    return {"status_code": status_code, "error": response}