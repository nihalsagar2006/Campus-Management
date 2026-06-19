from typing import List, Dict, Tuple, Optional, Any
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.models.registration import Registration
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # List of tuples: (websocket, user_id)
        # user_id can be None for guest/unauthenticated users
        self.active_connections: List[Tuple[WebSocket, Optional[int]]] = []

    async def connect(self, websocket: WebSocket, user_id: Optional[int] = None):
        await websocket.accept()
        self.active_connections.append((websocket, user_id))
        logger.info(f"WS Connected: {websocket.client} (User: {user_id})")

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [conn for conn in self.active_connections if conn[0] != websocket]
        logger.info(f"WS Disconnected: {websocket.client}")

    async def broadcast_json(self, message: Dict[str, Any]):
        """
        Broadcast standard JSON to all connections.
        """
        for connection, _ in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message to connection: {e}")

    async def send_targeted_notification(self, notification_data: Dict[str, Any], db: Session):
        """
        Sends a notification in real-time, respecting target rules.
        """
        target_type = notification_data.get("target_type", "all")
        target_user_id = notification_data.get("target_user_id")
        target_event_id = notification_data.get("target_event_id")

        payload = {
            "type": "new_announcement",
            "notification": notification_data
        }

        # 1. Global Announcement
        if target_type == "all" or (not target_user_id and not target_event_id):
            await self.broadcast_json(payload)
            logger.info("WS: Broadcasted global notification")
            return

        # 2. Targeted User Announcement
        if target_type == "user" and target_user_id:
            for connection, conn_user_id in self.active_connections:
                if conn_user_id == target_user_id:
                    try:
                        await connection.send_json(payload)
                        logger.info(f"WS: Sent notification to user {target_user_id}")
                    except Exception as e:
                        logger.error(f"WS error: {e}")
            return

        # 3. Targeted Event Participants Announcement
        if target_type == "event" and target_event_id:
            # Query all registered user IDs for this event
            registrations = (
                db.query(Registration.user_id)
                .filter(Registration.event_id == target_event_id, Registration.status == "registered")
                .all()
            )
            participant_ids = {r.user_id for r in registrations}

            for connection, conn_user_id in self.active_connections:
                # If connected user is registered for the targeted event, send it
                if conn_user_id in participant_ids:
                    try:
                        await connection.send_json(payload)
                        logger.info(f"WS: Sent notification to participant {conn_user_id} of event {target_event_id}")
                    except Exception as e:
                        logger.error(f"WS error: {e}")
            return

manager = ConnectionManager()
