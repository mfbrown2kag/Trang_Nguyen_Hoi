#!/usr/bin/env python3
"""
Test MySQL connection specifically
"""

import os
from dotenv import load_dotenv
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

def test_mysql_connection():
    """Test MySQL connection directly"""
    print("🔍 Testing MySQL Connection")
    print("=" * 40)
    
    # Get MySQL credentials
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_NAME = os.getenv("DB_NAME", "email_guardian")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    
    print(f"Host: {DB_HOST}")
    print(f"Port: {DB_PORT}")
    print(f"Database: {DB_NAME}")
    print(f"User: {DB_USER}")
    print(f"Password: {'*' * len(DB_PASSWORD) if DB_PASSWORD else 'None'}")
    
    # Test 1: Direct PyMySQL connection
    print("\n1️⃣ Testing direct PyMySQL connection...")
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4'
        )
        print("✅ PyMySQL connection successful!")
        
        # Test query
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM email_analyses")
            result = cursor.fetchone()
            count = result[0] if result else 0
            print(f"✅ Found {count} records in email_analyses table")
        
        connection.close()
        
    except Exception as e:
        print(f"❌ PyMySQL connection failed: {e}")
        return False
    
    # Test 2: SQLAlchemy connection
    print("\n2️⃣ Testing SQLAlchemy connection...")
    try:
        DATABASE_URL = f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT COUNT(*) FROM email_analyses"))
            row = result.fetchone()
            count = row[0] if row else 0
            print(f"✅ SQLAlchemy connection successful!")
            print(f"✅ Found {count} records in email_analyses table")
        
    except Exception as e:
        print(f"❌ SQLAlchemy connection failed: {e}")
        return False
    
    # Test 3: Check table structure
    print("\n3️⃣ Checking table structure...")
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE email_analyses")
            columns = cursor.fetchall()
            print("✅ Table structure:")
            for column in columns:
                print(f"   {column[0]}: {column[1]}")
        
        connection.close()
        
    except Exception as e:
        print(f"❌ Table structure check failed: {e}")
    
    print("\n" + "=" * 40)
    print("🎯 MySQL Connection Test Complete!")
    return True

if __name__ == "__main__":
    test_mysql_connection() 