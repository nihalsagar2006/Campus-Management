from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.event import Event

class RegistrationBase(BaseModel):
    event_id: int

class RegistrationCreate(RegistrationBase):
    extra_details: Optional[str] = None
    is_team: Optional[bool] = False
    team_name: Optional[str] = None
    team_logo: Optional[str] = None
    team_size: Optional[int] = 1

class RegistrationInDBBase(RegistrationBase):
    id: int
    user_id: int
    status: str
    qr_code_data: str
    extra_details: Optional[str] = None
    certificate_role: Optional[str] = None
    created_at: datetime
    
    is_team: bool
    team_name: Optional[str] = None
    team_logo: Optional[str] = None
    invite_code: Optional[str] = None
    team_size: int
    team_id: Optional[int] = None
    event: Optional[Event] = None

    class Config:
        orm_mode = True
        from_attributes = True

class Registration(RegistrationInDBBase):
    pass

class TeammateJoinRequest(BaseModel):
    extra_details: str


