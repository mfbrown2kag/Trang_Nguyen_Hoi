#!/usr/bin/env python3
"""
Update database schema to add missing columns
"""

import sys
import os
from sqlalchemy import text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db, engine

def update_database_schema():
    """Update database schema to add missing columns"""
    print("🔧 UPDATING DATABASE SCHEMA")
    print("=" * 50)
    
    try:
        db = next(get_db())
        
        # Check current table structure
        print("🔍 Current table structure:")
        result = db.execute(text("PRAGMA table_info(email_analyses)"))
        columns = result.fetchall()
        current_columns = [col[1] for col in columns]
        print(f"Current columns: {current_columns}")
        
        # Add missing columns
        missing_columns = []
        
        if 'created_at' not in current_columns:
            missing_columns.append("created_at")
        if 'updated_at' not in current_columns:
            missing_columns.append("updated_at")
        if 'features' not in current_columns:
            missing_columns.append("features")
        if 'recommendations' not in current_columns:
            missing_columns.append("recommendations")
        
        if missing_columns:
            print(f"\n➕ Adding missing columns: {missing_columns}")
            
            for column in missing_columns:
                try:
                    if column in ['created_at', 'updated_at']:
                        db.execute(text(f"ALTER TABLE email_analyses ADD COLUMN {column} DATETIME"))
                    else:
                        db.execute(text(f"ALTER TABLE email_analyses ADD COLUMN {column} TEXT"))
                    print(f"✅ Added column: {column}")
                except Exception as e:
                    print(f"⚠️ Column {column} might already exist: {e}")
            
            db.commit()
            print("✅ Database schema updated!")
        else:
            print("✅ All columns already exist!")
        
        # Verify updated structure
        print("\n🔍 Updated table structure:")
        result = db.execute(text("PRAGMA table_info(email_analyses)"))
        columns = result.fetchall()
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Check if there are any records
        result = db.execute(text("SELECT COUNT(*) FROM email_analyses"))
        count_result = result.fetchone()
        count = count_result[0] if count_result else 0
        print(f"\n📊 Total records in database: {count}")
        
        if count > 0:
            # Update existing records with default values
            print("\n🔄 Updating existing records...")
            db.execute(text("""
                UPDATE email_analyses 
                SET created_at = datetime('now'), 
                    updated_at = datetime('now'),
                    features = '{}',
                    recommendations = '[]'
                WHERE created_at IS NULL
            """))
            db.commit()
            print("✅ Existing records updated!")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Database update failed: {e}")

if __name__ == "__main__":
    update_database_schema() 