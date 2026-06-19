import logging
from sqlalchemy import inspect, text
from app.db.session import engine

logger = logging.getLogger(__name__)

def run_migrations():
    inspector = inspect(engine)
    
    # Check if 'notifications' table exists before inspecting columns
    if not inspector.has_table('notifications'):
        logger.info("Migration: 'notifications' table does not exist yet. It will be created by metadata.create_all.")
        return
        
    columns = [col['name'] for col in inspector.get_columns('notifications')]
    
    with engine.begin() as conn:
        # Add 'category' if missing
        if 'category' not in columns:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN category VARCHAR DEFAULT 'info'"))
            logger.info("Migration: Added column 'category' to 'notifications'")
            
        # Add 'display_style' if missing
        if 'display_style' not in columns:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN display_style VARCHAR DEFAULT 'card'"))
            logger.info("Migration: Added column 'display_style' to 'notifications'")
            
        # Add 'event_id' if missing
        if 'event_id' not in columns:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN event_id INTEGER REFERENCES events(id)"))
            logger.info("Migration: Added column 'event_id' to 'notifications'")
            
        # Add 'target_type' if missing
        if 'target_type' not in columns:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN target_type VARCHAR DEFAULT 'all'"))
            logger.info("Migration: Added column 'target_type' to 'notifications'")
            
        # Add 'target_user_id' if missing
        if 'target_user_id' not in columns:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN target_user_id INTEGER REFERENCES users(id)"))
            logger.info("Migration: Added column 'target_user_id' to 'notifications'")
            
        # Add 'target_event_id' if missing
        if 'target_event_id' not in columns:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN target_event_id INTEGER REFERENCES events(id)"))
            logger.info("Migration: Added column 'target_event_id' to 'notifications'")

    # Check registrations table columns
    if not inspector.has_table('registrations'):
        logger.info("Migration: 'registrations' table does not exist yet.")
        return

    reg_columns = [col['name'] for col in inspector.get_columns('registrations')]
    with engine.begin() as conn:
        # Add 'is_team' if missing
        if 'is_team' not in reg_columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN is_team BOOLEAN DEFAULT 0"))
            logger.info("Migration: Added column 'is_team' to 'registrations'")
            
        # Add 'team_name' if missing
        if 'team_name' not in reg_columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN team_name VARCHAR"))
            logger.info("Migration: Added column 'team_name' to 'registrations'")
            
        # Add 'team_logo' if missing
        if 'team_logo' not in reg_columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN team_logo VARCHAR"))
            logger.info("Migration: Added column 'team_logo' to 'registrations'")
            
        # Add 'invite_code' if missing
        if 'invite_code' not in reg_columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN invite_code VARCHAR"))
            logger.info("Migration: Added column 'invite_code' to 'registrations'")
            
        # Add 'team_size' if missing
        if 'team_size' not in reg_columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN team_size INTEGER DEFAULT 1"))
            logger.info("Migration: Added column 'team_size' to 'registrations'")
            
        # Add 'team_id' if missing
        if 'team_id' not in reg_columns:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN team_id INTEGER REFERENCES registrations(id)"))
            logger.info("Migration: Added column 'team_id' to 'registrations'")

