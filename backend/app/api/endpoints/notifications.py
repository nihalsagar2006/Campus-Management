from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from jose import jwt
import logging

from app.api import deps

logger = logging.getLogger(__name__)
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.models.notification import Notification, UserNotificationRead, NotificationView
from app.models.registration import Registration
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
    NotificationHistoryItem,
    NotificationStatsResponse,
)
from app.core.websocket import manager

router = APIRouter()

def get_optional_current_user(
    request: Request,
    db: Session = Depends(deps.get_db)
) -> Optional[User]:
    """
    Optional current user verification helper that doesn't fail on missing authorization.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = None
):
    """
    Real-time notifications WebSocket channel.
    """
    from app.db.session import SessionLocal
    db = SessionLocal()
    user_id = None
    if token:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
            )
            user_id = int(payload.get("sub"))
        except Exception as e:
            logger.error(f"WS Auth token decode error: {e}")
            
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Listening for connection check / keep alive ping
            data = await websocket.receive_text()
            # Simple pong reply
            await websocket.send_text(f"pong: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()

@router.get("/active", response_model=List[NotificationResponse])
def get_active_notifications(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> Any:
    """
    Retrieve active notifications tailored and personalized for the current user.
    """
    now = datetime.now()
    
    # 1. Base query: active status and within start/end schedule
    query = db.query(Notification).filter(
        Notification.is_active == True,
        or_(Notification.start_time == None, Notification.start_time <= now),
        or_(Notification.end_time == None, Notification.end_time >= now),
    )
    
    # 2. Filter notifications based on user targeting
    if current_user:
        # Get active events the user is registered for
        registered_event_ids = [
            r.event_id for r in db.query(Registration.event_id)
            .filter(Registration.user_id == current_user.id, Registration.status == "registered")
            .all()
        ]
        
        query = query.filter(
            or_(
                Notification.target_type == "all",
                and_(Notification.target_type == "user", Notification.target_user_id == current_user.id),
                and_(Notification.target_type == "event", Notification.target_event_id.in_(registered_event_ids))
            )
        )
    else:
        # If no user is authenticated, only fetch global announcements
        query = query.filter(Notification.target_type == "all")
        
    active_notices = (
        query.order_by(Notification.is_pinned.desc(), Notification.priority.desc(), Notification.created_at.desc())
        .all()
    )
    return active_notices

@router.get("/all", response_model=List[NotificationResponse])
def get_all_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Retrieve all notifications (Admin only).
    """
    return db.query(Notification).order_by(Notification.created_at.desc()).all()

@router.post("/", response_model=NotificationResponse)
def create_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_in: NotificationCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create a new notification and broadcast it to active real-time connections (Admin only).
    """
    db_notice = Notification(
        content=notification_in.content,
        type=notification_in.type,
        link_url=notification_in.link_url,
        priority=notification_in.priority,
        is_pinned=notification_in.is_pinned,
        is_active=notification_in.is_active,
        start_time=notification_in.start_time,
        end_time=notification_in.end_time,
        category=notification_in.category,
        display_style=notification_in.display_style,
        event_id=notification_in.event_id,
        target_type=notification_in.target_type,
        target_user_id=notification_in.target_user_id,
        target_event_id=notification_in.target_event_id,
        created_by_id=current_user.id,
    )
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    
    # Broadcast to WS connections
    try:
        try:
            response_data = NotificationResponse.from_orm(db_notice).dict()
        except AttributeError:
            response_data = NotificationResponse.model_validate(db_notice).model_dump()
            
        # Serialize datetime fields for websocket transmission
        for key in ["created_at", "updated_at", "start_time", "end_time"]:
            if response_data.get(key):
                response_data[key] = response_data[key].isoformat()
                
        import asyncio
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(manager.send_targeted_notification(response_data, db))
        else:
            loop.run_until_complete(manager.send_targeted_notification(response_data, db))
    except Exception as e:
        logger.error(f"Failed to broadcast created notification via WebSocket: {e}")
        
    return db_notice

@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    notification_in: NotificationUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a notification (Admin only).
    """
    notice = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    update_data = notification_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notice, field, value)
        
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

@router.delete("/{notification_id}")
def delete_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a notification (Admin only).
    """
    notice = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    # Delete related views and reads first
    db.query(UserNotificationRead).filter(UserNotificationRead.notification_id == notification_id).delete()
    db.query(NotificationView).filter(NotificationView.notification_id == notification_id).delete()
    db.delete(notice)
    db.commit()
    return {"message": "Notification deleted successfully"}

@router.get("/history", response_model=List[NotificationHistoryItem])
def get_notification_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get recent notification history for active user with read/unread statuses.
    """
    now = datetime.now()
    
    # Get active events the user is registered for
    registered_event_ids = [
        r.event_id for r in db.query(Registration.event_id)
        .filter(Registration.user_id == current_user.id, Registration.status == "registered")
        .all()
    ]
    
    notices = (
        db.query(Notification)
        .filter(
            Notification.is_active == True,
            or_(Notification.start_time == None, Notification.start_time <= now),
            or_(
                Notification.target_type == "all",
                and_(Notification.target_type == "user", Notification.target_user_id == current_user.id),
                and_(Notification.target_type == "event", Notification.target_event_id.in_(registered_event_ids))
            )
        )
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    
    # Get read notifications IDs for this user
    read_entries = (
        db.query(UserNotificationRead)
        .filter(UserNotificationRead.user_id == current_user.id)
        .all()
    )
    read_ids = {entry.notification_id for entry in read_entries}
    
    history = []
    for n in notices:
        history.append(
            NotificationHistoryItem(
                id=n.id,
                content=n.content,
                type=n.type,
                link_url=n.link_url,
                priority=n.priority,
                is_pinned=n.is_pinned,
                is_active=n.is_active,
                start_time=n.start_time,
                end_time=n.end_time,
                category=n.category,
                display_style=n.display_style,
                event_id=n.event_id,
                target_type=n.target_type,
                target_user_id=n.target_user_id,
                target_event_id=n.target_event_id,
                created_by_id=n.created_by_id,
                created_at=n.created_at,
                is_read=(n.id in read_ids),
            )
        )
    return history

@router.post("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a notification as read.
    """
    existing = db.query(UserNotificationRead).filter(
        UserNotificationRead.user_id == current_user.id,
        UserNotificationRead.notification_id == notification_id,
    ).first()
    if existing:
        return {"message": "Already marked as read"}
        
    read_record = UserNotificationRead(
        user_id=current_user.id,
        notification_id=notification_id
    )
    db.add(read_record)
    db.commit()
    return {"message": "Notification marked as read"}

@router.post("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark all current active notifications as read.
    """
    now = datetime.now()
    
    registered_event_ids = [
        r.event_id for r in db.query(Registration.event_id)
        .filter(Registration.user_id == current_user.id, Registration.status == "registered")
        .all()
    ]
    
    active_notices = (
        db.query(Notification)
        .filter(
            Notification.is_active == True,
            or_(Notification.start_time == None, Notification.start_time <= now),
            or_(Notification.end_time == None, Notification.end_time >= now),
            or_(
                Notification.target_type == "all",
                and_(Notification.target_type == "user", Notification.target_user_id == current_user.id),
                and_(Notification.target_type == "event", Notification.target_event_id.in_(registered_event_ids))
            )
        )
        .all()
    )
    
    read_entries = (
        db.query(UserNotificationRead)
        .filter(UserNotificationRead.user_id == current_user.id)
        .all()
    )
    read_ids = {entry.notification_id for entry in read_entries}
    
    count = 0
    for n in active_notices:
        if n.id not in read_ids:
            read_record = UserNotificationRead(
                user_id=current_user.id,
                notification_id=n.id
            )
            db.add(read_record)
            count += 1
            
    if count > 0:
        db.commit()
        
    return {"message": f"{count} notifications marked as read"}

@router.post("/{notification_id}/view")
def record_notification_view(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> Any:
    """
    Record a view (impression) for a notification.
    """
    notice = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    view = NotificationView(
        notification_id=notification_id,
        user_id=current_user.id if current_user else None
    )
    db.add(view)
    db.commit()
    return {"message": "View recorded successfully"}

@router.get("/{notification_id}/stats", response_model=NotificationStatsResponse)
def get_notification_stats(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get view statistics (total and unique views) for a notification (Admin only).
    """
    notice = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    total_views = db.query(NotificationView).filter(NotificationView.notification_id == notification_id).count()
    
    unique_registered_views = db.query(NotificationView.user_id).filter(
        NotificationView.notification_id == notification_id,
        NotificationView.user_id != None
    ).distinct().count()
    
    anonymous_views = db.query(NotificationView).filter(
        NotificationView.notification_id == notification_id,
        NotificationView.user_id == None
    ).count()
    
    unique_views = unique_registered_views + anonymous_views
    
    return NotificationStatsResponse(
        notification_id=notification_id,
        total_views=total_views,
        unique_views=unique_views
    )
