from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.app_bundle.env_config_settings import get_settings
from app.user.user_model import (
    Yasho_User
)
from app.visit.visit_model import Visit


async def get_db_session_db(tenant_id: str = get_settings().tenant_id):
    client = AsyncIOMotorClient(get_settings().mongo_uri)
    db_name = f"{tenant_id}_{get_settings().environment}"
    await init_beanie(
        database=client[db_name],
        document_models=[
            Yasho_User,
            Visit
        ],
    )
