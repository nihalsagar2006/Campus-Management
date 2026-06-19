import os
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from app.api import deps
from app.models.user import User

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    AI Event Assistant Chatbot
    """
    # Simple Mock/Placeholder for AI logic since no API key is provided
    # In production, integrate with google-generativeai or openai here.
    user_msg = request.message.lower()
    
    if "event" in user_msg or "upcoming" in user_msg:
        reply = f"Hi {current_user.full_name}, you can check the Events tab to see all upcoming campus events and register for them!"
    elif "ticket" in user_msg or "qr" in user_msg:
        reply = "You can view your QR code tickets in the 'My Tickets' section. Show it at the venue for attendance."
    elif "certificate" in user_msg:
        reply = "Once your attendance is marked by an admin, you can download your certificate from the 'My Tickets' page."
    else:
        reply = "I am your AI Campus Event Assistant. You can ask me about upcoming events, how to find your tickets, or how to get your certificate!"
        
    return {"reply": reply}
