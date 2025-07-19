"""
FastAPI Server for Email Guardian
Provides REST API endpoints for the frontend application
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
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

# In-memory storage for demo (in production, use a real database)
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
async def analyze_email(request: EmailAnalysisRequest):
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
        
        # Update system stats
        system_stats["total_analyzed"] += 1
        system_stats["total_processing_time"] += processing_time
        
        if result["classification"] == "spam":
            system_stats["spam_detected"] += 1
        elif result["classification"] == "phishing":
            system_stats["phishing_blocked"] += 1
        
        # Create response
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
        
        # Store in history (limit to last 100 items)
        history_item = {
            "id": str(uuid.uuid4()),
            "text": request.text[:200] + "..." if len(request.text) > 200 else request.text,
            "classification": result["classification"],
            "confidence": result["confidence"],
            "timestamp": datetime.now().isoformat(),
            "processing_time": processing_time
        }
        
        analysis_history.insert(0, history_item)
        if len(analysis_history) > 100:
            analysis_history.pop()
        
        return response
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

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
async def get_stats(range: str = "week"):
    """Get system statistics"""
    
    # Calculate average confidence from recent history
    recent_analyses = analysis_history[:50] if analysis_history else []
    avg_confidence = sum(item["confidence"] for item in recent_analyses) / len(recent_analyses) if recent_analyses else 0.85
    
    # Calculate average processing time
    avg_processing_time = (system_stats["total_processing_time"] / system_stats["total_analyzed"]) if system_stats["total_analyzed"] > 0 else 250
    
    # Calculate success rate (simplified)
    success_rate = 0.98  # High success rate for demo
    
    # Generate weekly trend data (mock data based on range)
    weekly_trend = generate_trend_data(range)
    
    # Generate distribution data
    total_safe = max(0, system_stats["total_analyzed"] - system_stats["spam_detected"] - system_stats["phishing_blocked"])
    distribution = {
        "safe": total_safe,
        "spam": system_stats["spam_detected"],
        "phishing": system_stats["phishing_blocked"],
        "suspicious": max(0, int(system_stats["total_analyzed"] * 0.05))  # 5% suspicious
    }
    
    return StatsResponse(
        totalAnalyzed=system_stats["total_analyzed"],
        spamDetected=system_stats["spam_detected"],
        phishingBlocked=system_stats["phishing_blocked"],
        avgConfidence=avg_confidence,
        processingTime=int(avg_processing_time),
        successRate=success_rate,
        weeklyTrend=weekly_trend,
        distribution=distribution,
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/history")
async def get_history(limit: int = 50, classification: Optional[str] = None):
    """Get analysis history"""
    
    # Filter by classification if specified
    filtered_history = analysis_history
    if classification and classification != "all":
        filtered_history = [item for item in analysis_history if item["classification"] == classification]
    
    # Apply limit
    limited_history = filtered_history[:limit]
    
    return {
        "history": limited_history,
        "total": len(filtered_history),
        "showing": len(limited_history),
        "timestamp": datetime.now().isoformat()
    }

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