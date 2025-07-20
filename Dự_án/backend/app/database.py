"""
Database configuration and models for Email Guardian
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, text
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import QueuePool
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration - Using SQLite for testing
DB_TYPE = os.getenv("DB_TYPE", "sqlite")  # sqlite or mysql

if DB_TYPE == "mysql":
    # MySQL configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "email_guardian")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DATABASE_URL = f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    # SQLite configuration (default for testing)
    DATABASE_URL = "sqlite:///./email_guardian.db"

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Set to True for SQL debugging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database Models
class EmailAnalysis(Base):
    """Model for storing email analysis results"""
    __tablename__ = "email_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    email_text = Column(Text, nullable=False)
    classification = Column(String(50), nullable=False)  # safe, spam, phishing, suspicious
    confidence = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False)
    processing_time = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    features = Column(Text, nullable=True)  # JSON string
    recommendations = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemStats(Base):
    """Model for storing system statistics"""
    __tablename__ = "system_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    total_analyzed = Column(Integer, default=0)
    spam_detected = Column(Integer, default=0)
    phishing_blocked = Column(Integer, default=0)
    suspicious_detected = Column(Integer, default=0)
    total_processing_time = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    success_rate = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

class UserSession(Base):
    """Model for storing user sessions"""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, index=True)
    user_ip = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# Database dependency
def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization
def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Initialize system stats if empty
        db = SessionLocal()
        try:
            stats = db.query(SystemStats).first()
            if not stats:
                initial_stats = SystemStats()
                db.add(initial_stats)
                db.commit()
                print("✅ Initial system stats created")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise

# Database health check
def check_db_connection():
    """Check if database connection is working"""
    try:
        db = SessionLocal()
        # Use text() for raw SQL
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# Utility functions
def get_system_stats(db: Session):
    """Get current system statistics"""
    stats = db.query(SystemStats).first()
    if not stats:
        stats = SystemStats()
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats

def update_system_stats(db: Session, **kwargs):
    """Update system statistics"""
    stats = get_system_stats(db)
    for key, value in kwargs.items():
        if hasattr(stats, key):
            setattr(stats, key, value)
    # Update timestamp manually using SQLAlchemy update
    db.execute(
        text("UPDATE system_stats SET last_updated = :now WHERE id = :id"),
        {"now": datetime.utcnow(), "id": stats.id}
    )
    db.commit()
    return stats 