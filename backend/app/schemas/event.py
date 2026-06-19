from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventBase(BaseModel):
    title: str
    description: str
    category: str
    date_time: datetime
    venue: str
    capacity: int
    deadline: datetime
    status: Optional[str] = "upcoming"
    poster_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date_time: Optional[datetime] = None
    venue: Optional[str] = None
    capacity: Optional[int] = None
    deadline: Optional[datetime] = None

class EventInDBBase(EventBase):
    id: int
    organizer_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class Event(EventInDBBase):
    pass
