from datetime import datetime,timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
import pytz

from beanie import Indexed
from pydantic import BaseModel

from app.app_bundle.database.base import MongoDocument
from app.app_bundle.env_config_settings import get_settings
from app.user.user_enum import UserEntity

IST = pytz.timezone("Asia/Kolkata")


class Location(BaseModel):
    lng:str
    lat:str

class Yasho_User(MongoDocument):
    name:str
    mobile:Indexed(str)
    password:str
    email:Optional[str] = None
    entity_type:UserEntity
    user_id:str

    class Settings:
        name = f"{get_settings().service_name}_{get_settings().environment}_user"

    def check_password(self, password):
        return bcrypt.checkpw(password.encode("utf-8"), self.password.encode())

    def token(self, entity_type):
        return jwt.encode(
            {
                "user_id": str(self.user_id),
                "entity_type": str(entity_type.value),
                "exp": datetime.now(tz=IST) + timedelta(days=1),
            },
            key=get_settings().jwt_secret,
            algorithm="HS256",
            headers={"alg": "HS256", "typ": "JWT"},
        )

def hash_password(password: str) -> bytes:
    pw = bytes(password, "utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw, salt)


class Admin(Yasho_User):
    entity_type:UserEntity = UserEntity.admin

class Client(Yasho_User):
    entity_type:UserEntity = UserEntity.client
    address: str
    location:Location

class Employee(Yasho_User):
    entity_type:UserEntity = UserEntity.employee
    dob: str
    sex: Literal["male", "female"]
    address: str
    photo: str
    id_proof: str
