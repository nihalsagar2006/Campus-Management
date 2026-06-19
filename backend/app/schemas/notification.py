from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    content: str
    type: Optional[str] = "info"  # info, success, warning, urgent
    link_url: Optional[str] = None
    priority: Optional[int] = 0
    is_pinned: Optional[bool] = False
    is_active: Optional[bool] = True
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    
    # New announcement center fields
    category: Optional[str] = "info"
    display_style: Optional[str] = "card"
    event_id: Optional[int] = None
    target_type: Optional[str] = "all"
    target_user_id: Optional[int] = None
    target_event_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    content: Optional[str] = None
    type: Optional[str] = None
    link_url: Optional[str] = None
    priority: Optional[int] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    category: Optional[str] = None
    display_style: Optional[str] = None
    event_id: Optional[int] = None
    target_type: Optional[str] = None
    target_user_id: Optional[int] = None
    target_event_id: Optional[int] = None

class NotificationResponse(NotificationBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class NotificationHistoryItem(NotificationResponse):
    is_read: bool = False

    class Config:
        orm_mode = True
        from_attributes = True

class NotificationStatsResponse(BaseModel):
    notification_id: int
    total_views: int
    unique_views: int

