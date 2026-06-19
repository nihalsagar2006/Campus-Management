import os
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch

from app.api import deps
from app.models.registration import Registration
from app.models.user import User
from app.models.event import Event

router = APIRouter()

@router.get("/download/{registration_id}")
def download_certificate(
    registration_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Download certificate for an attended event.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    if reg.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if reg.status != "attended":
        raise HTTPException(status_code=400, detail="Cannot generate certificate. You did not attend the event.")
        
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    user = db.query(User).filter(User.id == reg.user_id).first()
    
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # Draw border
    c.setLineWidth(5)
    c.rect(0.5*inch, 0.5*inch, width - 1*inch, height - 1*inch)
    
    # Text content
    role = reg.certificate_role
    title_text = f"Certificate of {role.title()}" if role and role.lower() in ["winner", "runner-up", "mvp"] else ("Certificate of Achievement" if role else "Certificate of Attendance")

    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2.0, height - 2*inch, title_text)
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2.0, height - 3.5*inch, "This is to certify that")
    
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2.0, height - 4.5*inch, user.full_name.upper())
    
    c.setFont("Helvetica", 18)
    if role:
        desc_text = f"has been awarded the distinction of {role.upper()} in the event"
    else:
        desc_text = "has successfully attended the event"
    c.drawCentredString(width/2.0, height - 5.5*inch, desc_text)
    
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2.0, height - 6.5*inch, event.title)
    
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2.0, height - 7*inch, f"Held on: {event.date_time.strftime('%B %d, %Y')}")
    
    # Verify QR Code
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, 1*inch, f"Verification ID: {reg.qr_code_data}")
    
    c.save()
    
    buffer.seek(0)
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=certificate_{event.id}.pdf"}
    )
