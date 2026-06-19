from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(String, default="pending")  # pending_members, pending, approved, rejected, attended, cancelled
    qr_code_data = Column(String, unique=True, index=True, nullable=False)
    extra_details = Column(Text, nullable=True)  # Stores JSON string of custom registration fields
    certificate_role = Column(String, nullable=True)  # e.g., "Winner", "Runner-up", "MVP", "Participant"
    
    # Team registration extensions
    is_team = Column(Boolean, default=False)
    team_name = Column(String, nullable=True)
    team_logo = Column(String, nullable=True)
    invite_code = Column(String, unique=True, index=True, nullable=True)
    team_size = Column(Integer, default=1)
    team_id = Column(Integer, ForeignKey("registrations.id"), nullable=True)
    
    user = relationship("User", foreign_keys=[user_id])
    event = relationship("Event", foreign_keys=[event_id])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (UniqueConstraint('user_id', 'event_id', name='_user_event_uc'),)

