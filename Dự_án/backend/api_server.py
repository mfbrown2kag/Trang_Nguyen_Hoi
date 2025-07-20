"""
FastAPI Server for Email Guardian
Provides REST API endpoints for the frontend application
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import time
import asyncio
import uuid
from datetime import datetime, timedelta
import json

# Import our core logic
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
from app.core_logic import get_analyzer

# Pydantic models for request/response
class EmailAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Email content to analyze")
    timestamp: Optional[str] = Field(None, description="Request timestamp")
    options: Optional[Dict[str, Any]] = Field(default={}, description="Analysis options")

class EmailAnalysisResponse(BaseModel):
    classification: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    features: Dict[str, Any]
    explanation: str
    processing_time: int
    risk_score: int = Field(..., ge=0, le=100)
    recommendations: List[str]
    timestamp: str

class BatchAnalysisRequest(BaseModel):
    emails: List[str] = Field(..., description="List of email texts to analyze")
    
    class Config:
        # Validate max 10 emails
        @validator('emails')
        def validate_emails(cls, v):
            if len(v) > 10:
                raise ValueError('Maximum 10 emails allowed per batch')
            return v

class StatsResponse(BaseModel):
    totalAnalyzed: int
    spamDetected: int
    phishingBlocked: int
    avgConfidence: float
    processingTime: int
    successRate: float
    weeklyTrend: List[Dict[str, Any]]
    distribution: Dict[str, int]
    timestamp: str

class HistoryItem(BaseModel):
    id: str
    text: str
    classification: str
    confidence: float
    timestamp: str
    processing_time: int

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    model_loaded: bool

# Initialize FastAPI app
app = FastAPI(
    title="Email Guardian API",
    description="AI-powered email security analysis API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database imports
from sqlalchemy.orm import Session
from app.database import get_db, init_db, check_db_connection
from app.database_utils import (
    save_email_analysis, 
    get_analysis_history, 
    update_system_statistics, 
    get_system_statistics
)
from app.database import EmailAnalysis
from sqlalchemy import func
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Initialize database on startup
try:
    init_db()
    print("✅ Database initialized successfully")
except Exception as e:
    print(f"⚠️ Database initialization warning: {e}")
    print("Continuing with in-memory storage...")

# Fallback in-memory storage (if database fails)
analysis_history: List[Dict] = []
system_stats = {
    "total_analyzed": 0,
    "spam_detected": 0,
    "phishing_blocked": 0,
    "total_processing_time": 0,
    "start_time": datetime.now()
}

# Initialize analyzer
try:
    analyzer = get_analyzer()
    print("✅ Email analyzer initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize analyzer: {e}")
    analyzer = None

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with basic info"""
    return {
        "message": "Email Guardian API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if analyzer is not None else "unhealthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        model_loaded=analyzer is not None
    )

@app.post("/api/analyze", response_model=EmailAnalysisResponse)
async def analyze_email(request: EmailAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze a single email"""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Email analyzer not available")
    
    start_time = time.time()
    
    try:
        # Perform analysis using our core logic
        result = analyzer.analyze_email(request.text)
        
        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)
        result["processing_time"] = processing_time
        result["text"] = request.text
        
        # Try to save to database first
        try:
            if check_db_connection():
                save_email_analysis(db, result)
                update_system_statistics(db, result)
                print("✅ Analysis saved to database")
            else:
                # Fallback to in-memory storage
                update_in_memory_stats(result)
                print("⚠️ Using in-memory storage (database unavailable)")
        except Exception as db_error:
            print(f"⚠️ Database error: {db_error}")
            # Fallback to in-memory storage
            update_in_memory_stats(result)
        
        # Create response with proper encoding
        response = EmailAnalysisResponse(
            classification=result["classification"],
            confidence=result["confidence"],
            features=result["features"],
            explanation=result["explanation"],
            processing_time=processing_time,
            risk_score=result["risk_score"],
            recommendations=result["recommendations"],
            timestamp=datetime.now().isoformat()
        )
        
        # Return JSON response with proper encoding
        return JSONResponse(
            content=response.dict(),
            headers={"Content-Type": "application/json; charset=utf-8"}
        )
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def update_in_memory_stats(result):
    """Update in-memory statistics (fallback)"""
    global system_stats
    system_stats["total_analyzed"] += 1
    system_stats["total_processing_time"] += result["processing_time"]
    
    if result["classification"] == "spam":
        system_stats["spam_detected"] += 1
    elif result["classification"] == "phishing":
        system_stats["phishing_blocked"] += 1
    
    # Store in history (limit to last 100 items)
    history_item = {
        "id": str(uuid.uuid4()),
        "text": result["text"][:200] + "..." if len(result["text"]) > 200 else result["text"],
        "classification": result["classification"],
        "confidence": result["confidence"],
        "timestamp": datetime.now().isoformat(),
        "processing_time": result["processing_time"]
    }
    
    analysis_history.insert(0, history_item)
    if len(analysis_history) > 100:
        analysis_history.pop()

@app.post("/api/analyze/batch")
async def analyze_batch(request: BatchAnalysisRequest):
    """Analyze multiple emails in batch"""
    if not analyzer:
        raise HTTPException(status_code=503, detail="Email analyzer not available")
    
    results = []
    
    for email_text in request.emails:
        try:
            # Create individual request
            individual_request = EmailAnalysisRequest(
                text=email_text,
                timestamp=datetime.now().isoformat()
            )
            result = await analyze_email(individual_request)
            results.append(result)
        except Exception as e:
            # Add error result for failed analysis
            results.append({
                "error": str(e),
                "text": email_text[:100] + "..." if len(email_text) > 100 else email_text
            })
    
    return {"results": results, "total": len(request.emails), "processed": len(results)}

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats(range: str = "week", db: Session = Depends(get_db)):
    """Get system statistics"""
    
    try:
        # Check if database has data
        total_records = db.query(EmailAnalysis).count()
        
        if total_records > 0:
            # Use database data
            print(f"📊 Using database data ({total_records} records)")
            stats_data = get_system_statistics(db)
            return StatsResponse(**stats_data)
        else:
            # Fallback to in-memory stats
            print("📊 Database empty, using in-memory stats")
            return get_in_memory_stats(range)
    except Exception as e:
        print(f"⚠️ Database stats error: {e}")
        # Fallback to in-memory stats
        return get_in_memory_stats(range)

def get_in_memory_stats(range: str):
    """Get statistics from in-memory storage (fallback)"""
    # If no real data, provide realistic mock data
    if system_stats["total_analyzed"] == 0:
        # Mock data for demo
        mock_total = 1250
        mock_spam = 187
        mock_phishing = 62
        mock_safe = 1001
        
        # Calculate average confidence from recent history
        recent_analyses = analysis_history[:50] if analysis_history else []
        avg_confidence = sum(item["confidence"] for item in recent_analyses) / len(recent_analyses) if recent_analyses else 0.87
        
        # Generate weekly trend data (mock data based on range)
        weekly_trend = generate_trend_data(range)
        
        # Generate distribution data
        distribution = {
            "safe": mock_safe,
            "spam": mock_spam,
            "phishing": mock_phishing,
            "suspicious": 63
        }
        
        return StatsResponse(
            totalAnalyzed=mock_total,
            spamDetected=mock_spam,
            phishingBlocked=mock_phishing,
            avgConfidence=avg_confidence,
            processingTime=245,
            successRate=0.98,
            weeklyTrend=weekly_trend,
            distribution=distribution,
            timestamp=datetime.now().isoformat()
        )
    else:
        # Use real in-memory data
        recent_analyses = analysis_history[:50] if analysis_history else []
        avg_confidence = sum(item["confidence"] for item in recent_analyses) / len(recent_analyses) if recent_analyses else 0.85
        
        # Calculate average processing time
        avg_processing_time = (system_stats["total_processing_time"] / system_stats["total_analyzed"]) if system_stats["total_analyzed"] > 0 else 250
        
        # Generate weekly trend data
        weekly_trend = generate_trend_data(range)
        
        # Generate distribution data
        total_safe = max(0, system_stats["total_analyzed"] - system_stats["spam_detected"] - system_stats["phishing_blocked"])
        distribution = {
            "safe": total_safe,
            "spam": system_stats["spam_detected"],
            "phishing": system_stats["phishing_blocked"],
            "suspicious": max(0, int(system_stats["total_analyzed"] * 0.05))
        }
        
        return StatsResponse(
            totalAnalyzed=system_stats["total_analyzed"],
            spamDetected=system_stats["spam_detected"],
            phishingBlocked=system_stats["phishing_blocked"],
            avgConfidence=avg_confidence,
            processingTime=int(avg_processing_time),
            successRate=0.98,
            weeklyTrend=weekly_trend,
            distribution=distribution,
            timestamp=datetime.now().isoformat()
        )

@app.get("/api/history")
async def get_history(limit: int = 50, classification: Optional[str] = None, db: Session = Depends(get_db)):
    """Get analysis history"""
    try:
        # Check if database has data
        total_records = db.query(EmailAnalysis).count()
        
        if total_records > 0:
            # Use database data
            print(f"📋 Using database history ({total_records} records)")
            history_data = get_analysis_history(db, limit, classification)
            return {
                "history": history_data,
                "total": len(history_data),
                "showing": len(history_data),
                "limit": limit,
                "classification_filter": classification,
                "source": "database"
            }
        else:
            # Fallback to in-memory history
            print("📋 Database empty, using in-memory history")
            return get_in_memory_history(limit, classification)
    except Exception as e:
        print(f"⚠️ Database history error: {e}")
        # Fallback to in-memory history
        return get_in_memory_history(limit, classification)

def get_in_memory_history(limit: int, classification: Optional[str] = None):
    """Get history from in-memory storage (fallback)"""
    try:
        # If no real history, provide mock data
        if not analysis_history:
            mock_history = [
                {
                    "id": "mock-1",
                    "text": "Subject: Invoice #INV-2025-001\nFrom: billing@company.com\n\nPlease find attached invoice...",
                    "classification": "Hóa đơn",
                    "confidence": 0.92,
                    "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "processing_time": 245
                },
                {
                    "id": "mock-2", 
                    "text": "Subject: CONGRATULATIONS!\nFrom: lottery@fake.com\n\nYou won $1,000,000! Click here...",
                    "classification": "Spam",
                    "confidence": 0.95,
                    "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
                    "processing_time": 198
                },
                {
                    "id": "mock-3",
                    "text": "Subject: Account Suspended\nFrom: security@bank.com\n\nYour account has been suspended...",
                    "classification": "Lừa đảo", 
                    "confidence": 0.88,
                    "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
                    "processing_time": 312
                },
                {
                    "id": "mock-4",
                    "text": "Subject: Meeting Update\nFrom: john@company.com\n\nHi team, meeting tomorrow at 2 PM...",
                    "classification": "An toàn",
                    "confidence": 0.85,
                    "timestamp": (datetime.now() - timedelta(hours=8)).isoformat(),
                    "processing_time": 156
                },
                {
                    "id": "mock-5",
                    "text": "Subject: Special Offer\nFrom: marketing@store.com\n\nLimited time offer! 50% off...",
                    "classification": "Khuyến mãi",
                    "confidence": 0.79,
                    "timestamp": (datetime.now() - timedelta(hours=10)).isoformat(),
                    "processing_time": 223
                }
            ]
            
            # Filter by classification if specified
            filtered_history = mock_history
            if classification and classification != "all":
                filtered_history = [item for item in mock_history if item["classification"] == classification]
            
            # Apply limit
            limited_history = filtered_history[:limit]
            
            return {
                "history": limited_history,
                "total": len(filtered_history),
                "showing": len(limited_history),
                "timestamp": datetime.now().isoformat(),
                "source": "memory"
            }
        else:
            # Use real in-memory history
            filtered_history = analysis_history
            if classification and classification != "all":
                filtered_history = [item for item in analysis_history if item["classification"] == classification]
            
            # Apply limit
            limited_history = filtered_history[:limit]
            
            return {
                "history": limited_history,
                "total": len(filtered_history),
                "showing": len(limited_history),
                "timestamp": datetime.now().isoformat(),
                "source": "memory"
            }
    except Exception as e:
        print(f"❌ History error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")

def generate_trend_data(time_range: str) -> List[Dict[str, Any]]:
    """Generate trend data based on time range"""
    
    days_map = {"today": 1, "week": 7, "month": 30, "quarter": 90}
    days = days_map.get(time_range, 7)
    
    trend_data = []
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-i-1)
        
        # Generate realistic but fake data
        base_volume = 100 + (i * 10) + (abs(hash(date.strftime("%Y-%m-%d"))) % 50)
        
        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "safe": int(base_volume * 0.75),
            "spam": int(base_volume * 0.15),
            "phishing": int(base_volume * 0.05),
            "suspicious": int(base_volume * 0.05)
        })
    
    return trend_data

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics from database"""
    try:
        # Check if database has data
        total_records = db.query(EmailAnalysis).count()
        
        if total_records > 0:
            # Use database data
            print(f"📊 Using database dashboard stats ({total_records} records)")
            
            # Get total analyzed emails
            total_analyzed = total_records
            
            # Get classification counts
            spam_count = db.query(EmailAnalysis).filter(
                EmailAnalysis.classification.in_(['Spam', 'Khuyến mãi'])
            ).count()
            
            phishing_count = db.query(EmailAnalysis).filter(
                EmailAnalysis.classification.in_(['Lừa đảo', 'Phần mềm độc hại'])
            ).count()
            
            safe_count = db.query(EmailAnalysis).filter(
                EmailAnalysis.classification.in_(['An toàn', 'Thông báo', 'Hóa đơn'])
            ).count()
        else:
            # Fallback to in-memory stats
            print("📊 Database empty, using in-memory dashboard stats")
            return get_in_memory_stats("week")
        
        suspicious_count = db.query(EmailAnalysis).filter(
            EmailAnalysis.classification.in_(['Đáng ngờ', 'Cần xem xét thêm'])
        ).count()
        
        # Calculate average confidence
        avg_confidence_result = db.query(func.avg(EmailAnalysis.confidence)).scalar()
        avg_confidence = round(float(avg_confidence_result) if avg_confidence_result else 0, 1)
        
        # Calculate average processing time
        avg_processing_time_result = db.query(func.avg(EmailAnalysis.processing_time)).scalar()
        avg_processing_time = round(float(avg_processing_time_result) if avg_processing_time_result else 0)
        
        # Calculate success rate (emails with confidence > 50%)
        success_count = db.query(EmailAnalysis).filter(EmailAnalysis.confidence > 0.5).count()
        success_rate = round((success_count / total_analyzed * 100) if total_analyzed > 0 else 0, 1)
        
        return {
            "total_analyzed": total_analyzed,
            "spam_detected": spam_count,
            "phishing_blocked": phishing_count,
            "safe_emails": safe_count,
            "suspicious_emails": suspicious_count,
            "avg_confidence": avg_confidence,
            "avg_processing_time": avg_processing_time,
            "success_rate": success_rate
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get dashboard statistics"}
        )

@app.get("/api/dashboard/trends")
async def get_dashboard_trends(period: str = "week", db: Session = Depends(get_db)):
    """Get trend data for charts"""
    try:
        # Calculate date range based on period
        end_date = datetime.now()
        if period == "week":
            start_date = end_date - timedelta(days=7)
            days = 7
        elif period == "month":
            start_date = end_date - timedelta(days=30)
            days = 30
        else:  # day
            start_date = end_date - timedelta(days=1)
            days = 1
        
        # Generate labels
        labels = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            labels.append(date.strftime("%m/%d"))
        
        # Get data for each day
        safe_data = []
        spam_data = []
        phishing_data = []
        suspicious_data = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            next_date = date + timedelta(days=1)
            
            # Count emails for each classification on this day
            day_safe = db.query(EmailAnalysis).filter(
                EmailAnalysis.created_at >= date,
                EmailAnalysis.created_at < next_date,
                EmailAnalysis.classification.in_(['An toàn', 'Thông báo', 'Hóa đơn'])
            ).count()
            
            day_spam = db.query(EmailAnalysis).filter(
                EmailAnalysis.created_at >= date,
                EmailAnalysis.created_at < next_date,
                EmailAnalysis.classification.in_(['Spam', 'Khuyến mãi'])
            ).count()
            
            day_phishing = db.query(EmailAnalysis).filter(
                EmailAnalysis.created_at >= date,
                EmailAnalysis.created_at < next_date,
                EmailAnalysis.classification.in_(['Lừa đảo', 'Phần mềm độc hại'])
            ).count()
            
            day_suspicious = db.query(EmailAnalysis).filter(
                EmailAnalysis.created_at >= date,
                EmailAnalysis.created_at < next_date,
                EmailAnalysis.classification.in_(['Đáng ngờ', 'Cần xem xét thêm'])
            ).count()
            
            safe_data.append(day_safe)
            spam_data.append(day_spam)
            phishing_data.append(day_phishing)
            suspicious_data.append(day_suspicious)
        
        return {
            "labels": labels,
            "safe": safe_data,
            "spam": spam_data,
            "phishing": phishing_data,
            "suspicious": suspicious_data
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard trends: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get trend data"}
        )

@app.get("/api/dashboard/distribution")
async def get_dashboard_distribution(period: str = "week", db: Session = Depends(get_db)):
    """Get email distribution data for pie chart"""
    try:
        # Calculate date range based on period
        end_date = datetime.now()
        if period == "week":
            start_date = end_date - timedelta(days=7)
        elif period == "month":
            start_date = end_date - timedelta(days=30)
        else:  # day
            start_date = end_date - timedelta(days=1)
        
        # Get counts for each classification
        safe_count = db.query(EmailAnalysis).filter(
            EmailAnalysis.created_at >= start_date,
            EmailAnalysis.classification.in_(['An toàn', 'Thông báo', 'Hóa đơn'])
        ).count()
        
        spam_count = db.query(EmailAnalysis).filter(
            EmailAnalysis.created_at >= start_date,
            EmailAnalysis.classification.in_(['Spam', 'Khuyến mãi'])
        ).count()
        
        phishing_count = db.query(EmailAnalysis).filter(
            EmailAnalysis.created_at >= start_date,
            EmailAnalysis.classification.in_(['Lừa đảo', 'Phần mềm độc hại'])
        ).count()
        
        suspicious_count = db.query(EmailAnalysis).filter(
            EmailAnalysis.created_at >= start_date,
            EmailAnalysis.classification.in_(['Đáng ngờ', 'Cần xem xét thêm'])
        ).count()
        
        return {
            "safe": safe_count,
            "spam": spam_count,
            "phishing": phishing_count,
            "suspicious": suspicious_count
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard distribution: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get distribution data"}
        )

@app.get("/api/analysis/activity")
async def get_analysis_activity(limit: int = 10, offset: int = 0, db: Session = Depends(get_db)):
    """Get analysis history for activity feed"""
    try:
        # Get recent analyses
        analyses = db.query(EmailAnalysis).order_by(
            EmailAnalysis.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        # Convert to JSON-serializable format
        history = []
        for analysis in analyses:
            history.append({
                "id": analysis.id,
                "email_text": analysis.email_text,
                "classification": analysis.classification,
                "confidence": analysis.confidence,
                "timestamp": analysis.created_at.isoformat(),
                "processing_time": analysis.processing_time
            })
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting analysis activity: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get analysis activity"}
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat(),
            "status_code": 500
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 Email Guardian API starting up...")
    print(f"📊 Analyzer status: {'✅ Ready' if analyzer else '❌ Not available'}")
    print("🌐 API Documentation available at: /api/docs")

# Shutdown event  
@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Email Guardian API shutting down...")

if __name__ == "__main__":
    import uvicorn
    
    # Start the API server
    print("🚀 Starting Email Guardian API Server...")
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 