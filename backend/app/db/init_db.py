import logging
from app.db.session import SessionLocal
from app.models.user import User
from app.core import security

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    from app.db.base import Base
    from app.db.session import engine
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    user = db.query(User).filter(User.email == "admin@campus.edu").first()
    if not user:
        user_in = User(
            email="admin@campus.edu",
            hashed_password=security.get_password_hash("admin123"),
            full_name="System Admin",
            is_active=True,
            is_admin=True,
        )
        db.add(user_in)
        db.commit()
        db.refresh(user_in)
        logger.info("Admin user created")
    else:
        logger.info("Admin user already exists")

    from app.models.event import Event
    from datetime import datetime, timedelta
    
    flagship_events = [
        {
            "title": "Esports Championship",
            "category": "Esports",
            "description": "Ultimate campus gaming showdown! Featuring BGMI, Free Fire, Call of Duty Mobile, Valorant, and FIFA with solo/team registration, brackets, leaderboards, match updates, MVPs, and prize pools.",
            "venue": "Main Auditorium / Gaming Arena",
            "date_time": datetime.now() + timedelta(days=30),
            "capacity": 500,
            "deadline": datetime.now() + timedelta(days=28),
        },
        {
            "title": "CodeSprint Hackathon",
            "category": "Technology",
            "description": "A high-octane 6-hour innovation challenge! Solve real-world campus problems, build fully working prototypes, and pitch to judges for awards in innovation, technical excellence, and impact.",
            "venue": "Computer Center Lab 3",
            "date_time": datetime.now() + timedelta(days=35),
            "capacity": 150,
            "deadline": datetime.now() + timedelta(days=33),
        },
        {
            "title": "TechNova Exhibition",
            "category": "Technology",
            "description": "Showcase of students' hardware, software, IoT, AI, websites, mobile apps, robotics, and research projects. Includes visitor voting, professional judging panel, and major cash prizes.",
            "venue": "Exhibition Hall A",
            "date_time": datetime.now() + timedelta(days=40),
            "capacity": 300,
            "deadline": datetime.now() + timedelta(days=38),
        },
        {
            "title": "Entrepreneurship Pitch & Vibe",
            "category": "Business",
            "description": "Got a startup idea? Present your business models, prototypes, and pitch decks to real judges and investors. Network with mentors and secure startup incubation awards.",
            "venue": "Seminar Hall 1",
            "date_time": datetime.now() + timedelta(days=45),
            "capacity": 100,
            "deadline": datetime.now() + timedelta(days=43),
        },
        {
            "title": "Sports Arena",
            "category": "Sports",
            "description": "Inter-department sports league featuring Cricket, Football, and Kabaddi. Complete with fixtures, knockout rounds, score tracking, points tables, and MVP recognitions.",
            "venue": "Campus Sports Grounds",
            "date_time": datetime.now() + timedelta(days=50),
            "capacity": 1000,
            "deadline": datetime.now() + timedelta(days=48),
        }
    ]
    
    admin_user = db.query(User).filter(User.email == "admin@campus.edu").first()
    for ev_data in flagship_events:
        existing_ev = db.query(Event).filter(Event.title == ev_data["title"]).first()
        if not existing_ev:
            new_ev = Event(
                title=ev_data["title"],
                category=ev_data["category"],
                description=ev_data["description"],
                venue=ev_data["venue"],
                date_time=ev_data["date_time"],
                capacity=ev_data["capacity"],
                deadline=ev_data["deadline"],
                organizer_id=admin_user.id,
                status="upcoming"
            )
            db.add(new_ev)
            logger.info(f"Seeded event: {new_ev.title}")
    db.commit()

    from app.models.notification import Notification
    
    initial_notices = [
        {
            "content": "Emergency Notice: Server maintenance scheduled tonight from 12 AM to 2 AM. Some system modules may be temporarily unavailable.",
            "type": "urgent",
            "priority": 10,
            "is_pinned": True,
            "link_url": None,
        },
        {
            "content": "Winner Announcement: Congratulations to CS Titans for winning the Sports Arena Football Championship!",
            "type": "success",
            "priority": 5,
            "is_pinned": False,
            "link_url": "/events/5",
        },
        {
            "content": "Deadline Alert: Registration for CodeSprint Hackathon closes in 24 hours. Submit your team entry now!",
            "type": "warning",
            "priority": 8,
            "is_pinned": False,
            "link_url": "/events/2",
        },
        {
            "content": "Venue Change: TechNova Exhibition will now be held in the Main Exhibition Hall B instead of Hall A.",
            "type": "info",
            "priority": 3,
            "is_pinned": False,
            "link_url": "/events/3",
        }
    ]
    
    for notice_data in initial_notices:
        existing_notice = db.query(Notification).filter(Notification.content == notice_data["content"]).first()
        if not existing_notice:
            new_notice = Notification(
                content=notice_data["content"],
                type=notice_data["type"],
                priority=notice_data["priority"],
                is_pinned=notice_data["is_pinned"],
                link_url=notice_data["link_url"],
                is_active=True,
                created_by_id=admin_user.id
            )
            db.add(new_notice)
            logger.info(f"Seeded notice: {new_notice.content[:30]}...")
            
    db.commit()
    db.close()


if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
