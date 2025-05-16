from pydantic import BaseModel
from fastapi import Depends
import jwt
from app.app_bundle.env_config_settings import get_settings
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/user/login")

class CurrentUserInfo(BaseModel):
    user_id: str

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, get_settings().jwt_secret, algorithms="HS256")
    user_id = payload.get("user_id")
    entity_type = payload.get("entity_type")
    if user_id is None:
        return {"message":"Invalid User","status_code":401}
    return {"user_id":user_id,"entity_type":entity_type}

