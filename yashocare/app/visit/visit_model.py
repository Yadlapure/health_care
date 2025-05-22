import enum
from datetime import datetime,timedelta
from typing import Optional, List
import pytz

from beanie import Indexed
from pydantic import BaseModel, Field

from app.app_bundle.database.base import MongoDocument
from app.app_bundle.env_config_settings import get_settings

IST = pytz.timezone("Asia/Kolkata")


class Vital(BaseModel):
    bloodPressure:Optional[str]=None
    sugar:Optional[str]=None
    notes:str=""
    prescription_images:Optional[List[str]]=[]

class VisitStatus(enum.Enum):
    initiated="INITIATED"
    checkedIn="CHECKEDIN"
    checkedOut="CHECKEDOUT"
    vitalUpdate="VITALUPDATE"
    cancelledVisit="CANCELLEDVISIT"

class CheckInOut(BaseModel):
    at:Optional[datetime]=None
    lat:Optional[str]=None
    lng:Optional[str]=None
    img:Optional[str]=None

class Details(BaseModel):
    checkIn:Optional[CheckInOut]={}
    checkOut:Optional[CheckInOut]={}
    daily_status: VisitStatus = VisitStatus.initiated
    for_date:datetime.date = Field(default_factory=lambda: datetime.now(tz=pytz.UTC).date().isoformat())

class Visit(MongoDocument):
    assigned_client_id:str
    assigned_admin_id:str
    assigned_pract_id:str
    main_status: VisitStatus = VisitStatus.initiated
    vitals:Optional[Vital]={}
    details:Optional[List[Details]]=[]
    visit_id:str

    class Config:
        arbitrary_types_allowed = True

    class Settings:
        name = f"{get_settings().service_name}_{get_settings().environment}_visit"

