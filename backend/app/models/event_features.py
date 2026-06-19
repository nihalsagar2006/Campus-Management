from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class EventAnnouncement(Base):
    __tablename__ = "event_announcements"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("Event")

class EventGallery(Base):
    __tablename__ = "event_galleries"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String, nullable=False)
    caption = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("Event")

class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    registration_id = Column(Integer, ForeignKey("registrations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    github_link = Column(String, nullable=True)
    tech_stack = Column(String, nullable=True)
    extra_fields = Column(Text, nullable=True)  # Stores JSON fields like project_type, pitch_deck_url, stage

    # Evaluation Scores
    score_innovation = Column(Integer, default=0)
    score_technical = Column(Integer, default=0)
    score_impact = Column(Integer, default=0)
    score_business_model = Column(Integer, default=0)
    score_market_strategy = Column(Integer, default=0)
    score_feasibility = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)
    visitor_votes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("Event")
    user = relationship("User")
    registration = relationship("Registration")

class ProjectVote(Base):
    __tablename__ = "project_votes"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_submission_id = Column(Integer, ForeignKey("project_submissions.id", ondelete="CASCADE"), nullable=False)

    event = relationship("Event")
    user = relationship("User")
    project_submission = relationship("ProjectSubmission")

class TournamentFixture(Base):
    __tablename__ = "tournament_fixtures"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    stage = Column(String, nullable=False)  # e.g., "BGMI Round 1", "Valorant Semifinals", "Cricket Quarterfinals"
    team_a = Column(String, nullable=False)
    team_b = Column(String, nullable=False)
    score_a = Column(Integer, default=0)
    score_b = Column(Integer, default=0)
    winner = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, ongoing, completed
    round_num = Column(Integer, default=1)
    match_time = Column(DateTime, nullable=True)

    event = relationship("Event")

class TournamentLeaderboard(Base):
    __tablename__ = "tournament_leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)  # e.g., "BGMI Standings", "Football Group A"
    team_name = Column(String, nullable=False)
    played = Column(Integer, default=0)
    won = Column(Integer, default=0)
    lost = Column(Integer, default=0)
    drawn = Column(Integer, default=0)
    points = Column(Integer, default=0)
    extra_stats = Column(String, nullable=True)  # JSON or plain text for net run rate, goals, kills, MVPs etc.

    event = relationship("Event")
