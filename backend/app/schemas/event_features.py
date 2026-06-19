from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Announcement Schemas
class EventAnnouncementBase(BaseModel):
    title: str
    content: str
    is_pinned: Optional[bool] = False

class EventAnnouncementCreate(EventAnnouncementBase):
    pass

class EventAnnouncement(EventAnnouncementBase):
    id: int
    event_id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# Gallery Schemas
class EventGalleryBase(BaseModel):
    image_url: str
    caption: Optional[str] = None

class EventGalleryCreate(EventGalleryBase):
    pass

class EventGallery(EventGalleryBase):
    id: int
    event_id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# Project Submission Schemas
class ProjectSubmissionBase(BaseModel):
    title: str
    description: str
    github_link: Optional[str] = None
    tech_stack: Optional[str] = None
    extra_fields: Optional[str] = None  # JSON encoded string

class ProjectSubmissionCreate(ProjectSubmissionBase):
    pass

class ProjectSubmissionGrade(BaseModel):
    score_innovation: Optional[int] = 0
    score_technical: Optional[int] = 0
    score_impact: Optional[int] = 0
    score_business_model: Optional[int] = 0
    score_market_strategy: Optional[int] = 0
    score_feasibility: Optional[int] = 0
    feedback: Optional[str] = None

class ProjectSubmission(ProjectSubmissionBase):
    id: int
    event_id: int
    user_id: int
    registration_id: int
    score_innovation: int
    score_technical: int
    score_impact: int
    score_business_model: int
    score_market_strategy: int
    score_feasibility: int
    feedback: Optional[str] = None
    visitor_votes: int
    created_at: datetime
    user_name: Optional[str] = None  # Helper to display developer name

    class Config:
        orm_mode = True
        from_attributes = True

# Fixture Schemas
class TournamentFixtureBase(BaseModel):
    stage: str
    team_a: str
    team_b: str
    score_a: Optional[int] = 0
    score_b: Optional[int] = 0
    winner: Optional[str] = None
    status: Optional[str] = "scheduled"  # scheduled, ongoing, completed
    round_num: Optional[int] = 1
    match_time: Optional[datetime] = None

class TournamentFixtureCreate(TournamentFixtureBase):
    pass

class TournamentFixture(TournamentFixtureBase):
    id: int
    event_id: int

    class Config:
        orm_mode = True
        from_attributes = True

# Leaderboard Schemas
class TournamentLeaderboardBase(BaseModel):
    category: str
    team_name: str
    played: Optional[int] = 0
    won: Optional[int] = 0
    lost: Optional[int] = 0
    drawn: Optional[int] = 0
    points: Optional[int] = 0
    extra_stats: Optional[str] = None  # e.g., "Kills: 15, MVP: Player1"

class TournamentLeaderboardCreate(TournamentLeaderboardBase):
    pass

class TournamentLeaderboard(TournamentLeaderboardBase):
    id: int
    event_id: int

    class Config:
        orm_mode = True
        from_attributes = True

# Certificate Issue Schema
class IssueCertificateSchema(BaseModel):
    user_id: int
    certificate_role: str  # e.g., "Winner", "Runner-up", "MVP", "Participant"
