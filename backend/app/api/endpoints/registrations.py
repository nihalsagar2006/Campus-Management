import uuid
import json
from datetime import datetime
from io import BytesIO
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch

from app.api import deps
from app.models.registration import Registration
from app.models.event import Event
from app.models.user import User
from app.schemas.registration import Registration as RegistrationSchema, RegistrationCreate, TeammateJoinRequest

router = APIRouter()

@router.post("/", response_model=RegistrationSchema)
def create_registration(
    *,
    db: Session = Depends(deps.get_db),
    reg_in: RegistrationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Register for an event (Leader or Solo).
    """
    event = db.query(Event).filter(Event.id == reg_in.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Check registration deadline
    if datetime.now() > event.deadline:
        raise HTTPException(status_code=400, detail="Registration deadline has passed")
        
    # Validation for Event-specific fields
    try:
        details = json.loads(reg_in.extra_details) if reg_in.extra_details else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format for extra_details")

    if event.category == "Esports":
        game = details.get("selectedCategory")
        if not game:
            raise HTTPException(status_code=400, detail="Game selection is required")
        if game not in ["BGMI", "Free Fire", "Call of Duty Mobile", "COD Mobile", "Valorant", "FIFA"]:
            raise HTTPException(status_code=400, detail="Invalid game selection")
            
        is_team = game != "FIFA"
        
        required_fields = ["iglName", "iglSrn", "branch", "email", "phone", "inGameUid", "inGameName", "inGamePfp"]
        if is_team:
            required_fields.extend(["teamName", "teamLogo", "teamSize"])
            
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for Esports registration: {', '.join(missing)}"
            )
            
    elif event.category == "Technology" and "Hackathon" in event.title:
        required_fields = ["teamName", "teamSize", "iglName", "iglSrn", "branch", "email", "phone", "collegeName", "projectTitle"]
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for Hackathon registration: {', '.join(missing)}"
            )
            
    elif event.category == "Technology" and "Exhibition" in event.title:
        required_fields = ["iglName", "iglSrn", "branch", "email", "phone", "selectedCategory", "section", "facultyMentor", "topicName", "projectDescription"]
        if reg_in.is_team:
            required_fields.extend(["teamName", "teamSize"])
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for Exhibition registration: {', '.join(missing)}"
            )
            
    elif event.category == "Business":
        required_fields = ["teamName", "teamSize", "iglName", "iglSrn", "branch", "email", "phone", "startupIdeaName", "startupCategory", "startupDescription"]
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for Entrepreneurship Pitch & Vibe: {', '.join(missing)}"
            )
            
    elif event.category == "Sports":
        sport = details.get("selectedCategory")
        if not sport:
            raise HTTPException(status_code=400, detail="Sport selection is required")
        if sport not in ["Cricket", "Football", "Kabaddi"]:
            raise HTTPException(status_code=400, detail="Invalid sport selection")
            
        required_fields = ["teamName", "teamSize", "iglName", "iglSrn", "branch", "email", "phone"]
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for Sports Arena registration: {', '.join(missing)}"
            )
        
    # Check if user is already registered for this event (directly or as teammate)
    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == reg_in.event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
        
    # Check event capacity
    count = db.query(Registration).filter(Registration.event_id == reg_in.event_id).count()
    if count >= event.capacity:
        raise HTTPException(status_code=400, detail="Event is at full capacity")
        
    qr_data = str(uuid.uuid4())
    invite_code = str(uuid.uuid4()) if reg_in.is_team else None
    
    # Status rules:
    # If it is a team registration and team_size > 1, start as pending_members
    # Else (solo or team size 1) start as pending (waiting for admin approval)
    reg_status = "pending_members" if (reg_in.is_team and reg_in.team_size and reg_in.team_size > 1) else "pending"
    
    db_reg = Registration(
        user_id=current_user.id,
        event_id=reg_in.event_id,
        qr_code_data=qr_data,
        extra_details=reg_in.extra_details,
        status=reg_status,
        is_team=reg_in.is_team,
        team_name=reg_in.team_name,
        team_logo=reg_in.team_logo,
        invite_code=invite_code,
        team_size=reg_in.team_size or 1,
        team_id=None
    )
    db.add(db_reg)
    db.commit()
    db.refresh(db_reg)
    return db_reg

@router.get("/by-invite/{invite_code}", response_model=dict)
def get_invite_details(
    invite_code: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get event and team details for an invitation link.
    """
    leader_reg = db.query(Registration).filter(Registration.invite_code == invite_code).first()
    if not leader_reg:
        raise HTTPException(status_code=404, detail="Invalid invitation link")
        
    event = db.query(Event).filter(Event.id == leader_reg.event_id).first()
    
    # Count members
    member_count = db.query(Registration).filter(
        or_(Registration.team_id == leader_reg.id, Registration.id == leader_reg.id)
    ).count()
    
    return {
        "event_id": event.id,
        "event_title": event.title,
        "event_category": event.category,
        "event_deadline": event.deadline.isoformat(),
        "team_name": leader_reg.team_name,
        "team_size": leader_reg.team_size,
        "slots_left": max(0, leader_reg.team_size - member_count),
        "leader_name": db.query(User).filter(User.id == leader_reg.user_id).first().full_name
    }

@router.post("/join/{invite_code}", response_model=RegistrationSchema)
def join_team(
    invite_code: str,
    req: TeammateJoinRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Join a team as a teammate using an invite code.
    """
    leader_reg = db.query(Registration).filter(Registration.invite_code == invite_code).first()
    if not leader_reg:
        raise HTTPException(status_code=404, detail="Invalid invitation link")
        
    event = db.query(Event).filter(Event.id == leader_reg.event_id).first()
    if datetime.now() > event.deadline:
        raise HTTPException(status_code=400, detail="Event registration deadline has passed")
        
    # Teammate profile validation
    try:
        details = json.loads(req.extra_details) if req.extra_details else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format for extra_details")

    if event.category == "Esports":
        required_fields = ["name", "srn", "branch", "email", "inGameUid", "inGameName", "inGamePfp"]
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for teammate registration: {', '.join(missing)}"
            )
            
    elif event.category == "Technology":
        required_fields = ["name", "srn", "branch", "email", "phone", "collegeName"]
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for teammate registration: {', '.join(missing)}"
            )
            
    elif event.category in ["Business", "Sports"]:
        required_fields = ["name", "srn", "branch", "email", "phone"]
        missing = [field for field in required_fields if not details.get(field)]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields for teammate registration: {', '.join(missing)}"
            )
        
    # Check if user is already registered for this event
    existing = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == leader_reg.event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already registered for this event")
        
    # Check current team members count
    member_regs = db.query(Registration).filter(
        or_(Registration.team_id == leader_reg.id, Registration.id == leader_reg.id)
    ).all()
    
    if len(member_regs) >= leader_reg.team_size:
        raise HTTPException(status_code=400, detail="Team is already full")
        
    # Create registration for teammate
    qr_data = str(uuid.uuid4())
    teammate_reg = Registration(
        user_id=current_user.id,
        event_id=leader_reg.event_id,
        qr_code_data=qr_data,
        extra_details=req.extra_details,
        status="pending_members",
        is_team=True,
        team_name=leader_reg.team_name,
        team_logo=leader_reg.team_logo,
        invite_code=None,
        team_size=leader_reg.team_size,
        team_id=leader_reg.id
    )
    db.add(teammate_reg)
    db.commit()
    db.refresh(teammate_reg)
    
    # Check if team is now complete
    total_count = len(member_regs) + 1
    if total_count >= leader_reg.team_size:
        # Update status of leader and all teammates to pending approval
        db.query(Registration).filter(
            or_(Registration.team_id == leader_reg.id, Registration.id == leader_reg.id)
        ).update({"status": "pending"})
        db.commit()
        db.refresh(teammate_reg)
        
    return teammate_reg

@router.put("/{registration_id}", response_model=RegistrationSchema)
def edit_registration(
    registration_id: int,
    reg_in: RegistrationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Allow participant to edit registration fields before deadline.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    if reg.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this registration")
        
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    if datetime.now() > event.deadline:
        raise HTTPException(status_code=400, detail="Deadline has passed. Cannot edit registration details.")
        
    reg.extra_details = reg_in.extra_details
    if reg_in.team_name:
        reg.team_name = reg_in.team_name
    if reg_in.team_logo:
        reg.team_logo = reg_in.team_logo
        
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg

@router.get("/team-status/{registration_id}", response_model=dict)
def get_team_status(
    registration_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get full team composition details and join progress.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration record not found")
        
    # Get the leader id (if this record is a teammate, use team_id; else use id)
    leader_id = reg.team_id if reg.team_id else reg.id
    leader_reg = db.query(Registration).filter(Registration.id == leader_id).first()
    
    # Query all joined members
    members = db.query(Registration).filter(
        or_(Registration.team_id == leader_id, Registration.id == leader_id)
    ).all()
    
    members_list = []
    for m in members:
        u = db.query(User).filter(User.id == m.user_id).first()
        members_list.append({
            "registration_id": m.id,
            "user_id": u.id,
            "name": u.full_name,
            "email": u.email,
            "is_leader": m.team_id is None,
            "status": m.status,
            "extra_details": json.loads(m.extra_details) if m.extra_details else {}
        })
        
    return {
        "team_name": leader_reg.team_name,
        "team_logo": leader_reg.team_logo,
        "team_size": leader_reg.team_size,
        "invite_code": leader_reg.invite_code,
        "status": leader_reg.status,
        "joined_count": len(members),
        "slots_left": max(0, leader_reg.team_size - len(members)),
        "members": members_list
    }

@router.get("/my", response_model=List[RegistrationSchema])
def read_user_registrations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's registrations.
    """
    regs = db.query(Registration).filter(Registration.user_id == current_user.id).all()
    return regs

@router.post("/mark_attendance")
def mark_attendance(
    qr_code_data: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Mark attendance by scanning QR code. Admin only.
    """
    reg = db.query(Registration).filter(Registration.qr_code_data == qr_code_data).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Invalid QR Code")
        
    if reg.status == "pending_members":
        raise HTTPException(
            status_code=400,
            detail="Registration is incomplete. All team members must join before check-in is allowed."
        )
        
    if reg.status == "attended":
        raise HTTPException(status_code=400, detail="Attendance already marked")
        
    reg.status = "attended"
    db.add(reg)
    db.commit()
    return {"message": "Attendance marked successfully", "user_id": reg.user_id, "event_id": reg.event_id}

@router.post("/{registration_id}/approve")
def approve_registration(
    registration_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Approve registration group/team. Admin only.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    # Get group members
    leader_id = reg.team_id if reg.team_id else reg.id
    db.query(Registration).filter(
        or_(Registration.team_id == leader_id, Registration.id == leader_id)
    ).update({"status": "approved"})
    db.commit()
    return {"message": "Registration approved successfully"}

@router.post("/{registration_id}/reject")
def reject_registration(
    registration_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Reject registration group/team. Admin only.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    # Get group members
    leader_id = reg.team_id if reg.team_id else reg.id
    db.query(Registration).filter(
        or_(Registration.team_id == leader_id, Registration.id == leader_id)
    ).update({"status": "rejected"})
    db.commit()
    return {"message": "Registration rejected successfully"}

@router.put("/{registration_id}/modify")
def modify_registration_admin(
    registration_id: int,
    reg_in: RegistrationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Modify registration records (Admin only).
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    reg.extra_details = reg_in.extra_details
    if reg_in.team_name:
        reg.team_name = reg_in.team_name
    if reg_in.team_logo:
        reg.team_logo = reg_in.team_logo
    if reg_in.team_size:
        reg.team_size = reg_in.team_size
        
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg

@router.get("/{registration_id}/confirmation-pdf")
def download_confirmation_pdf(
    registration_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Download PDF confirmation receipt for registration.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    # Check auth
    if reg.user_id != current_user.id and not current_user.is_admin:
        # Check if teammate
        is_teammate = db.query(Registration).filter(
            Registration.user_id == current_user.id,
            Registration.team_id == (reg.team_id or reg.id)
        ).first()
        if not is_teammate:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    u = db.query(User).filter(User.id == reg.user_id).first()
    
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Border
    c.setLineWidth(2)
    c.rect(0.5*inch, 0.5*inch, width - 1*inch, height - 1*inch)
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(1*inch, height - 1.5*inch, "CampusEvents Registration Confirmation")
    
    # Line
    c.setLineWidth(1)
    c.line(1*inch, height - 1.7*inch, width - 1*inch, height - 1.7*inch)
    
    # Event Info
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 2.2*inch, f"Event: {event.title}")
    
    c.setFont("Helvetica", 12)
    c.drawString(1*inch, height - 2.5*inch, f"Category: {event.category}")
    c.drawString(1*inch, height - 2.75*inch, f"Date: {event.date_time.strftime('%B %d, %Y - %I:%M %p')}")
    c.drawString(1*inch, height - 3*inch, f"Venue: {event.venue}")
    
    # Participant Info
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 3.5*inch, "Participant Details")
    
    details = {}
    try:
        details = json.loads(reg.extra_details) if reg.extra_details else {}
    except Exception:
        pass
        
    y_pos = height - 3.8*inch
    c.setFont("Helvetica", 11)
    c.drawString(1*inch, y_pos, f"Registered Member: {u.full_name}")
    c.drawString(1*inch, y_pos - 20, f"Email: {u.email}")
    c.drawString(1*inch, y_pos - 40, f"SRN: {details.get('srn', details.get('iglSrn', 'N/A'))}")
    c.drawString(1*inch, y_pos - 60, f"Branch: {details.get('branch', 'N/A')}")
    
    # Team Info (if team)
    if reg.is_team:
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y_pos - 100, f"Team Name: {reg.team_name or 'N/A'}")
        c.drawString(1*inch, y_pos - 120, f"Team Target Size: {reg.team_size}")
        
        c.setFont("Helvetica", 11)
        leader_id = reg.team_id if reg.team_id else reg.id
        teammates = db.query(Registration).filter(
            or_(Registration.team_id == leader_id, Registration.id == leader_id)
        ).all()
        
        c.drawString(1*inch, y_pos - 150, "Registered Team Composition:")
        m_pos = y_pos - 170
        for idx, m in enumerate(teammates):
            m_user = db.query(User).filter(User.id == m.user_id).first()
            m_name = m_user.full_name if m_user else "Unknown"
            c.drawString(1.2*inch, m_pos, f"{idx+1}. {m_name} ({m.status.upper()})")
            m_pos -= 18
            
        y_pos = m_pos - 20
    else:
        y_pos = y_pos - 100
        
    # Status
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y_pos, f"Registration Group Status: {reg.status.upper()}")
    
    # Verification Details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y_pos - 40, "Individual Check-in QR Data")
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y_pos - 55, f"{reg.qr_code_data}")
    
    c.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=registration_confirmation_{event.id}.pdf"}
    )
