from fastapi import APIRouter
from app.api.endpoints import auth, events, registrations, certificates, chatbot, event_features, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(event_features.router, prefix="/event_features", tags=["event_features"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])


