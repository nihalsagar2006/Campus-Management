from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, index=True)
    date_time = Column(DateTime, nullable=False)
    venue = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    deadline = Column(DateTime, nullable=False)
    status = Column(String, default="upcoming")  # upcoming, ongoing, completed, cancelled
    poster_url = Column(String, nullable=True)
    
    organizer_id = Column(Integer, ForeignKey("users.id"))
    organizer = relationship("User")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
