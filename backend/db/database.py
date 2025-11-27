"""
Database setup and models for the RAG Challenge Platform.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from pathlib import Path

# Use a persistent directory for database storage
# Default to local directory when running outside Docker
DEFAULT_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db_data")
DB_DIR = os.getenv("DB_DIR", DEFAULT_DB_DIR)
Path(DB_DIR).mkdir(parents=True, exist_ok=True)

# Database file path within the persistent directory
DB_PATH = os.path.join(DB_DIR, "challenges.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Submission(Base):
    """Track all submissions."""
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), index=True)
    challenge_id = Column(String(50), index=True)
    submission_type = Column(String(20))  # 'api' or 'python'
    submission_url = Column(String(500), nullable=True)
    submission_file = Column(String(500), nullable=True)
    status = Column(String(20), default="pending")  # pending, running, completed, failed
    error_message = Column(Text, nullable=True)  # Store error details
    feedback = Column(Text, nullable=True)  # Store hints for improvement
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class EvaluationResult(Base):
    """Store evaluation results."""
    __tablename__ = "evaluation_results"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, index=True)
    team_name = Column(String(100), index=True)
    challenge_id = Column(String(50), index=True)
    
    # Scores (overall combines public + private)
    overall_score = Column(Float)
    retrieval_score = Column(Float)
    faithfulness_score = Column(Float)
    reasoning_score = Column(Float)
    
    # Public/Private split scores
    public_score = Column(Float, nullable=True)   # Score on public test set (visible during competition)
    private_score = Column(Float, nullable=True)  # Score on private test set (revealed at end)
    
    # Detailed results
    question_results = Column(JSON)  # Per-question breakdown
    
    created_at = Column(DateTime, default=datetime.utcnow)


class LeaderboardEntry(Base):
    """Leaderboard entries."""
    __tablename__ = "leaderboard"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), index=True)
    challenge_id = Column(String(50), index=True)
    best_score = Column(Float)  # Overall best score (for backward compat)
    best_public_score = Column(Float, nullable=True)   # Best score on public test set
    best_private_score = Column(Float, nullable=True)  # Best score on private test set
    best_submission_id = Column(Integer, nullable=True)  # Submission ID for best score
    submission_count = Column(Integer, default=1)
    last_submission = Column(DateTime, default=datetime.utcnow)


async def init_db():
    """Initialize database tables and seed initial data if empty."""
    Base.metadata.create_all(bind=engine)
    
    # Seed initial data if database is empty
    from db.seed_data import seed_on_startup
    seed_on_startup()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

