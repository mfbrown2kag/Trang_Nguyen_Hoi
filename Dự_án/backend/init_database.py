#!/usr/bin/env python3
"""
Database initialization script for Email Guardian
Creates MySQL database and tables
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_mysql_database():
    """Create MySQL database if it doesn't exist"""
    import mysql.connector
    from mysql.connector import Error
    
    # Database configuration
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_NAME = os.getenv("DB_NAME", "email_guardian")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    
    try:
        # Connect directly to the existing database
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME  # Connect directly to existing database
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            print(f"✅ Connected to database '{DB_NAME}' successfully")
            
            # Create tables
            create_tables(cursor)
            
            cursor.close()
            connection.close()
            print("✅ Database initialization completed successfully")
            
    except Error as e:
        print(f"❌ Error connecting to MySQL: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure MySQL server is running")
        print("2. Check your database credentials in config.env")
        print("3. Ensure MySQL user has access to the database")
        print("4. Try connecting manually: mysql -u trang-nguyen-hoi -p -h 62.146.236.71")
        sys.exit(1)

def create_tables(cursor):
    """Create all necessary tables"""
    
    # Email analyses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS email_analyses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email_text TEXT NOT NULL,
            classification VARCHAR(50) NOT NULL,
            confidence FLOAT NOT NULL,
            risk_score INT NOT NULL,
            processing_time INT NOT NULL,
            explanation TEXT,
            features TEXT,
            recommendations TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_classification (classification),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✅ email_analyses table created")
    
    # System stats table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            total_analyzed INT DEFAULT 0,
            spam_detected INT DEFAULT 0,
            phishing_blocked INT DEFAULT 0,
            suspicious_detected INT DEFAULT 0,
            total_processing_time INT DEFAULT 0,
            avg_confidence FLOAT DEFAULT 0.0,
            success_rate FLOAT DEFAULT 0.0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✅ system_stats table created")
    
    # User sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            user_ip VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            INDEX idx_session_id (session_id),
            INDEX idx_last_activity (last_activity)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✅ user_sessions table created")
    
    # Insert initial system stats
    cursor.execute("""
        INSERT IGNORE INTO system_stats (id, total_analyzed, spam_detected, phishing_blocked, suspicious_detected, total_processing_time, avg_confidence, success_rate)
        VALUES (1, 0, 0, 0, 0, 0, 0.85, 0.98)
    """)
    print("✅ Initial system stats inserted")

def test_database_connection():
    """Test database connection using SQLAlchemy"""
    try:
        # Import after ensuring MySQL is available
        from app.database import check_db_connection, init_db
        
        print("\n🔍 Testing database connection...")
        
        if check_db_connection():
            print("✅ Database connection successful")
            
            print("🔍 Initializing database tables...")
            init_db()
            print("✅ Database tables initialized successfully")
            
        else:
            print("❌ Database connection failed")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure all dependencies are installed: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False
    
    return True

def main():
    """Main initialization function"""
    print("🚀 Email Guardian - Database Initialization")
    print("=" * 50)
    
    # Check if config file exists
    if not os.path.exists("config.env"):
        print("❌ config.env file not found!")
        print("Please copy config.env.example to config.env and configure your database settings")
        sys.exit(1)
    
    print("🔍 Creating MySQL database...")
    create_mysql_database()
    
    print("\n🔍 Testing SQLAlchemy connection...")
    if test_database_connection():
        print("\n🎉 Database initialization completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start the API server: uvicorn api_server:app --reload")
        print("2. Test the API: http://localhost:8000/api/health")
        print("3. View API docs: http://localhost:8000/api/docs")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 