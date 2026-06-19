import json
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.models.event_features import (
    EventAnnouncement,
    EventGallery,
    ProjectSubmission,
    ProjectVote,
    TournamentFixture,
    TournamentLeaderboard,
)
from app.schemas.event_features import (
    EventAnnouncement as AnnouncementSchema,
    EventAnnouncementCreate,
    EventGallery as GallerySchema,
    EventGalleryCreate,
    ProjectSubmission as SubmissionSchema,
    ProjectSubmissionCreate,
    ProjectSubmissionGrade,
    TournamentFixture as FixtureSchema,
    TournamentFixtureCreate,
    TournamentLeaderboard as LeaderboardSchema,
    TournamentLeaderboardCreate,
    IssueCertificateSchema,
)

router = APIRouter()

# ----------------- ANNOUNCEMENTS -----------------

@router.post("/{event_id}/announcements", response_model=AnnouncementSchema)
def create_announcement(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    announcement_in: EventAnnouncementCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db_announcement = EventAnnouncement(
        event_id=event_id,
        title=announcement_in.title,
        content=announcement_in.content,
        is_pinned=announcement_in.is_pinned,
    )
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    return db_announcement

@router.get("/{event_id}/announcements", response_model=List[AnnouncementSchema])
def get_announcements(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    announcements = (
        db.query(EventAnnouncement)
        .filter(EventAnnouncement.event_id == event_id)
        .order_by(EventAnnouncement.is_pinned.desc(), EventAnnouncement.created_at.desc())
        .all()
    )
    return announcements

@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    *,
    db: Session = Depends(deps.get_db),
    announcement_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    announcement = db.query(EventAnnouncement).filter(EventAnnouncement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted successfully"}


# ----------------- GALLERY -----------------

@router.post("/{event_id}/gallery", response_model=GallerySchema)
def add_gallery_image(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    gallery_in: EventGalleryCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db_gallery = EventGallery(
        event_id=event_id,
        image_url=gallery_in.image_url,
        caption=gallery_in.caption,
    )
    db.add(db_gallery)
    db.commit()
    db.refresh(db_gallery)
    return db_gallery

@router.get("/{event_id}/gallery", response_model=List[GallerySchema])
def get_gallery_images(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    gallery = (
        db.query(EventGallery)
        .filter(EventGallery.event_id == event_id)
        .order_by(EventGallery.created_at.desc())
        .all()
    )
    return gallery

@router.delete("/gallery/{gallery_id}")
def delete_gallery_image(
    *,
    db: Session = Depends(deps.get_db),
    gallery_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    gallery = db.query(EventGallery).filter(EventGallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    db.delete(gallery)
    db.commit()
    return {"message": "Gallery image deleted successfully"}


# ----------------- PROJECT SUBMISSIONS -----------------

@router.post("/{event_id}/submit_project", response_model=SubmissionSchema)
def submit_project(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    project_in: ProjectSubmissionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check registration
    reg = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == event_id
    ).first()
    if not reg:
        raise HTTPException(status_code=400, detail="You must register for this event before submitting a project")
    
    # Check duplicate submission
    existing = db.query(ProjectSubmission).filter(
        ProjectSubmission.event_id == event_id,
        ProjectSubmission.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a project for this event")
        
    db_submission = ProjectSubmission(
        event_id=event_id,
        user_id=current_user.id,
        registration_id=reg.id,
        title=project_in.title,
        description=project_in.description,
        github_link=project_in.github_link,
        tech_stack=project_in.tech_stack,
        extra_fields=project_in.extra_fields,
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

@router.get("/{event_id}/projects", response_model=List[SubmissionSchema])
def get_project_submissions(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    submissions = (
        db.query(ProjectSubmission)
        .filter(ProjectSubmission.event_id == event_id)
        .order_by(ProjectSubmission.created_at.desc())
        .all()
    )
    
    # Populate user_name dynamically
    for s in submissions:
        s.user_name = s.user.full_name
        
    return submissions

@router.post("/projects/{project_id}/vote")
def vote_for_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    project = db.query(ProjectSubmission).filter(ProjectSubmission.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check if user already voted in this event
    existing_vote = db.query(ProjectVote).filter(
        ProjectVote.event_id == project.event_id,
        ProjectVote.user_id == current_user.id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already voted for a project in this exhibition")
        
    vote = ProjectVote(
        event_id=project.event_id,
        user_id=current_user.id,
        project_submission_id=project_id
    )
    project.visitor_votes += 1
    
    db.add(vote)
    db.add(project)
    db.commit()
    return {"message": "Vote submitted successfully", "votes": project.visitor_votes}

@router.post("/projects/{project_id}/grade", response_model=SubmissionSchema)
def grade_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    grade_in: ProjectSubmissionGrade,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    project = db.query(ProjectSubmission).filter(ProjectSubmission.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project.score_innovation = grade_in.score_innovation
    project.score_technical = grade_in.score_technical
    project.score_impact = grade_in.score_impact
    project.score_business_model = grade_in.score_business_model
    project.score_market_strategy = grade_in.score_market_strategy
    project.score_feasibility = grade_in.score_feasibility
    project.feedback = grade_in.feedback
    
    db.add(project)
    db.commit()
    db.refresh(project)
    project.user_name = project.user.full_name
    return project


# ----------------- TOURNAMENT FIXTURES -----------------

@router.post("/{event_id}/fixtures", response_model=FixtureSchema)
def create_fixture(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    fixture_in: TournamentFixtureCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    db_fixture = TournamentFixture(
        event_id=event_id,
        stage=fixture_in.stage,
        team_a=fixture_in.team_a,
        team_b=fixture_in.team_b,
        score_a=fixture_in.score_a,
        score_b=fixture_in.score_b,
        winner=fixture_in.winner,
        status=fixture_in.status,
        round_num=fixture_in.round_num,
        match_time=fixture_in.match_time,
    )
    db.add(db_fixture)
    db.commit()
    db.refresh(db_fixture)
    return db_fixture

@router.put("/fixtures/{fixture_id}", response_model=FixtureSchema)
def update_fixture(
    *,
    db: Session = Depends(deps.get_db),
    fixture_id: int,
    fixture_in: TournamentFixtureCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    fixture = db.query(TournamentFixture).filter(TournamentFixture.id == fixture_id).first()
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
        
    update_data = fixture_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fixture, field, value)
        
    db.add(fixture)
    db.commit()
    db.refresh(fixture)
    return fixture

@router.delete("/fixtures/{fixture_id}")
def delete_fixture(
    *,
    db: Session = Depends(deps.get_db),
    fixture_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    fixture = db.query(TournamentFixture).filter(TournamentFixture.id == fixture_id).first()
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    db.delete(fixture)
    db.commit()
    return {"message": "Fixture deleted successfully"}

@router.get("/{event_id}/fixtures", response_model=List[FixtureSchema])
def get_fixtures(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    fixtures = (
        db.query(TournamentFixture)
        .filter(TournamentFixture.event_id == event_id)
        .order_by(TournamentFixture.round_num.asc(), TournamentFixture.match_time.asc())
        .all()
    )
    return fixtures


# ----------------- LEADERBOARDS / STANDINGS -----------------

@router.post("/{event_id}/leaderboard", response_model=LeaderboardSchema)
def upsert_leaderboard_row(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    leaderboard_in: TournamentLeaderboardCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    # Check if team row already exists in this category
    existing = db.query(TournamentLeaderboard).filter(
        TournamentLeaderboard.event_id == event_id,
        TournamentLeaderboard.category == leaderboard_in.category,
        TournamentLeaderboard.team_name == leaderboard_in.team_name
    ).first()
    
    if existing:
        # Update
        existing.played = leaderboard_in.played
        existing.won = leaderboard_in.won
        existing.lost = leaderboard_in.lost
        existing.drawn = leaderboard_in.drawn
        existing.points = leaderboard_in.points
        existing.extra_stats = leaderboard_in.extra_stats
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create
        db_row = TournamentLeaderboard(
            event_id=event_id,
            category=leaderboard_in.category,
            team_name=leaderboard_in.team_name,
            played=leaderboard_in.played,
            won=leaderboard_in.won,
            lost=leaderboard_in.lost,
            drawn=leaderboard_in.drawn,
            points=leaderboard_in.points,
            extra_stats=leaderboard_in.extra_stats
        )
        db.add(db_row)
        db.commit()
        db.refresh(db_row)
        return db_row

@router.get("/{event_id}/leaderboard", response_model=List[LeaderboardSchema])
def get_leaderboard(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    rows = (
        db.query(TournamentLeaderboard)
        .filter(TournamentLeaderboard.event_id == event_id)
        .order_by(TournamentLeaderboard.points.desc(), TournamentLeaderboard.won.desc())
        .all()
    )
    return rows

@router.delete("/leaderboard/{leaderboard_id}")
def delete_leaderboard_row(
    *,
    db: Session = Depends(deps.get_db),
    leaderboard_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    row = db.query(TournamentLeaderboard).filter(TournamentLeaderboard.id == leaderboard_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Leaderboard entry not found")
    db.delete(row)
    db.commit()
    return {"message": "Leaderboard row deleted"}


# ----------------- CUSTOM CERTIFICATE -----------------

@router.post("/{event_id}/issue_custom_certificate")
def issue_custom_certificate(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    cert_in: IssueCertificateSchema,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    reg = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.user_id == cert_in.user_id
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found for this user in this event")
        
    # Mark as attended and update role
    reg.status = "attended"
    reg.certificate_role = cert_in.certificate_role
    db.add(reg)
    db.commit()
    return {"message": f"Certificate for {cert_in.certificate_role} issued successfully"}



# ----------------- REGISTRATIONS LIST FOR ADMIN -----------------

@router.get("/{event_id}/registrations")
def get_event_registrations(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    regs = db.query(Registration).filter(Registration.event_id == event_id).all()
    results = []
    for r in regs:
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user.full_name,
            "status": r.status,
            "qr_code_data": r.qr_code_data,
            "extra_details": r.extra_details,
            "certificate_role": r.certificate_role,
            "created_at": r.created_at,
            "is_team": r.is_team,
            "team_name": r.team_name,
            "team_logo": r.team_logo,
            "team_size": r.team_size,
            "team_id": r.team_id,
            "invite_code": r.invite_code
        })
    return results


# ----------------- ANALYTICS -----------------

@router.get("/{event_id}/analytics")
def get_event_analytics(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Standard counts
    regs = db.query(Registration).filter(Registration.event_id == event_id).all()
    total_regs = len(regs)
    attended_count = sum(1 for r in regs if r.status == "attended")
    
    # Analyze solo vs team
    solo_count = 0
    team_count = 0
    team_names = []
    
    for r in regs:
        if r.extra_details:
            try:
                details = json.loads(r.extra_details)
                # Check if it has a team name or is team registration
                if "teamName" in details or "team_name" in details or details.get("regType") == "team" or details.get("reg_type") == "team":
                    team_count += 1
                    tname = details.get("teamName") or details.get("team_name") or "Unnamed Team"
                    if tname not in team_names:
                        team_names.append(tname)
                else:
                    solo_count += 1
            except:
                solo_count += 1
        else:
            solo_count += 1
            
    # Submissions
    submissions_count = db.query(ProjectSubmission).filter(ProjectSubmission.event_id == event_id).count()
    
    # Total visitor votes
    total_votes = db.query(ProjectVote).filter(ProjectVote.event_id == event_id).count()
    
    return {
        "title": event.title,
        "capacity": event.capacity,
        "total_registrations": total_regs,
        "attendance_count": attended_count,
        "solo_registrations": solo_count,
        "team_registrations": team_count,
        "unique_teams": len(team_names),
        "submissions_count": submissions_count,
        "total_votes_cast": total_votes,
    }
