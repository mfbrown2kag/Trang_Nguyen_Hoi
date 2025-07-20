#!/usr/bin/env python3
"""
Test database connection
"""

import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

# Load environment variables
load_dotenv('config.env')

def test_mysql_connection():
    """Test MySQL connection"""
    try:
        # Database configuration
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = int(os.getenv("DB_PORT", "3306"))
        DB_NAME = os.getenv("DB_NAME", "email_guardian")
        DB_USER = os.getenv("DB_USER", "root")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        
        print(f"🔍 Testing connection to {DB_HOST}:{DB_PORT}")
        print(f"Database: {DB_NAME}")
        print(f"User: {DB_USER}")
        
        # Connect to MySQL
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Test basic query
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            # Safe tuple access with list conversion
            version_list = list(version) if version else []
            version_str = version_list[0] if len(version_list) > 0 else 'Unknown'
            print(f"✅ MySQL Version: {version_str}")
            
            # Check existing tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            # Safe tuple access for table names with list conversion
            table_names = []
            for table in tables:
                if table:
                    table_list = list(table)
                    if len(table_list) > 0:
                        table_names.append(str(table_list[0]))
            print(f"✅ Existing tables: {table_names}")
            
            # Test creating a simple table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_connection (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    message VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("✅ Test table created successfully")
            
            # Insert test data
            cursor.execute("INSERT INTO test_connection (message) VALUES ('Database connection successful!')")
            connection.commit()
            print("✅ Test data inserted successfully")
            
            # Query test data
            cursor.execute("SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 1")
            result = cursor.fetchone()
            print(f"✅ Test query result: {result}")
            
            cursor.close()
            connection.close()
            print("✅ Database connection test completed successfully!")
            return True
            
    except Error as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Database Connection")
    print("=" * 40)
    test_mysql_connection() 