import os
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri:str
    config_s3_bucket: str
    aws_temp_ac_key: str
    aws_temp_sc_key: str
    environment: str
    service_name: str
    jwt_secret: str
    tenant_id: str = "yashocare"

    class Config:
        env_file = os.getcwd() + "/.env"


@lru_cache
def get_settings():
    for k, v in Settings():
        os.environ[str(k).upper()] = v

    return Settings()


settings = get_settings()
