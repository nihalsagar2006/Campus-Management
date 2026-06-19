from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    type = Column(String, default="info") # info, success, warning, urgent
    link_url = Column(String, nullable=True)
    priority = Column(Integer, default=0) # higher number = higher priority
    is_pinned = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    
    # New announcement center fields
    category = Column(String, default="info") # info, registration_opening, upcoming_event, hackathon_countdown, esports_schedule, sports_fixture, winner_announcement, certificate_availability, venue_change
    display_style = Column(String, default="card") # card, banner, popup, floating, widget
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    
    # Target options
    target_type = Column(String, default="all") # all, user, event
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class UserNotificationRead(Base):
    __tablename__ = "user_notification_reads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    notification_id = Column(Integer, ForeignKey("notifications.id"))
    read_at = Column(DateTime(timezone=True), server_default=func.now())

class NotificationView(Base):
    __tablename__ = "notification_views"
    
    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, ForeignKey("notifications.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())

