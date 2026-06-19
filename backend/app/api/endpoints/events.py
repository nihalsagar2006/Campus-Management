from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.event import Event
from app.models.user import User
from app.schemas.event import Event as EventSchema, EventCreate, EventUpdate

router = APIRouter()

@router.get("/", response_model=List[EventSchema])
def read_events(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve events.
    """
    events = db.query(Event).offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=EventSchema)
def create_event(
    *,
    db: Session = Depends(deps.get_db),
    event_in: EventCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new event. Only admins can create events.
    """
    event_data = event_in.dict()
    db_event = Event(**event_data, organizer_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=EventSchema)
def read_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update an event. Only admins can update.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
def delete_event(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete an event. Only admins can delete.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
