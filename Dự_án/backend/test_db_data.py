#!/usr/bin/env python3
"""
Test script to check database data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db, EmailAnalysis, init_db
from sqlalchemy import func

def test_database():
    print("🔍 Testing database connection and data...")
    
    try:
        # Initialize database
        init_db()
        print("✅ Database initialized")
        
        # Get database session
        db = next(get_db())
        
        # Check total records
        total_records = db.query(EmailAnalysis).count()
        print(f"📊 Total records in database: {total_records}")
        
        if total_records > 0:
            print("\n📋 Sample records:")
            for record in db.query(EmailAnalysis).limit(5).all():
                print(f"  ID: {record.id}")
                print(f"  Classification: {record.classification}")
                print(f"  Confidence: {record.confidence}")
                print(f"  Text: {record.email_text[:100]}...")
                print(f"  Timestamp: {record.timestamp}")
                print("  ---")
        else:
            print("❌ No records found in database")
            
        # Check classification distribution
        print("\n📈 Classification distribution:")
        classifications = db.query(
            EmailAnalysis.classification,
            func.count(EmailAnalysis.id).label('count')
        ).group_by(EmailAnalysis.classification).all()
        
        for classification, count in classifications:
            print(f"  {classification}: {count}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database() 