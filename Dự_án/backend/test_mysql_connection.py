#!/usr/bin/env python3
"""
Test MySQL Connection - Kiểm tra kết nối database giám khảo
==========================================================

Script test kết nối MySQL trước khi chạy server chính.
"""

import mysql.connector
import logging
import os
import json

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_config():
    """Load config từ file config.env"""
    config = {}
    try:
        if os.path.exists('config.env'):
            with open('config.env', 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        config[key.strip()] = value.strip()
        logger.info("✅ Config loaded from config.env")
    except Exception as e:
        logger.warning(f"⚠️ Failed to load config: {e}")
    
    return config

def test_mysql_connection():
    """Test kết nối MySQL"""
    try:
        # Load config
        config = load_config()
        
        # Cấu hình MySQL
        db_config = {
            'host': config.get('DB_HOST', '62.146.236.71'),
            'user': config.get('DB_USER', 'trang-nguyen-hoi'),
            'password': config.get('DB_PASSWORD', 'HCfibCPw4snScdSA'),
            'database': config.get('DB_NAME', 'trang-nguyen-hoi'),
            'port': int(config.get('DB_PORT', 3306)),
            'charset': 'utf8mb4',
            'connect_timeout': 10,
            'use_unicode': True
        }
        
        print("🔗 Testing MySQL Connection...")
        print(f"   Host: {db_config['host']}")
        print(f"   Port: {db_config['port']}")
        print(f"   User: {db_config['user']}")
        print(f"   Database: {db_config['database']}")
        print("")
        
        # Test kết nối
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        print("✅ MySQL connection successful!")
        
        # Test query
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ MySQL version: {version[0]}")
        
        # Test tạo bảng
        print("")
        print("📋 Testing table creation...")
        
        # Bảng email_analysis
        create_analysis_table = """
        CREATE TABLE IF NOT EXISTS email_analysis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email_text TEXT NOT NULL,
            classification VARCHAR(50) NOT NULL,
            confidence FLOAT NOT NULL,
            explanation TEXT NOT NULL,
            risk_score INT NOT NULL,
            recommendations TEXT,
            processing_time INT NOT NULL,
            ai_used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_classification (classification),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        
        cursor.execute(create_analysis_table)
        print("✅ email_analysis table created/verified")
        
        # Bảng analysis_stats
        create_stats_table = """
        CREATE TABLE IF NOT EXISTS analysis_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL,
            total_emails INT DEFAULT 0,
            safe_count INT DEFAULT 0,
            spam_count INT DEFAULT 0,
            phishing_count INT DEFAULT 0,
            malware_count INT DEFAULT 0,
            suspicious_count INT DEFAULT 0,
            avg_processing_time FLOAT DEFAULT 0,
            ai_usage_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        
        cursor.execute(create_stats_table)
        print("✅ analysis_stats table created/verified")
        
        # Test insert
        print("")
        print("📝 Testing data insertion...")
        
        test_insert = """
        INSERT INTO email_analysis (
            email_text, classification, confidence, explanation,
            risk_score, recommendations, processing_time, ai_used
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        test_data = (
            "Test email content",
            "safe",
            0.85,
            "This is a test explanation",
            10,
            json.dumps(["Test recommendation"]),
            100,
            True
        )
        
        cursor.execute(test_insert, test_data)
        print("✅ Test data inserted successfully")
        
        # Test select
        cursor.execute("SELECT COUNT(*) FROM email_analysis")
        count = cursor.fetchone()
        print(f"✅ Total records in email_analysis: {count[0]}")
        
        # Cleanup test data
        cursor.execute("DELETE FROM email_analysis WHERE email_text = 'Test email content'")
        print("✅ Test data cleaned up")
        
        # Close connection
        cursor.close()
        connection.close()
        
        print("")
        print("🎉 MySQL connection test PASSED!")
        print("✅ Database is ready for Email Guardian")
        print("")
        print("🚀 You can now run: python3 simple_server.py")
        
        return True
        
    except mysql.connector.Error as e:
        print(f"")
        print(f"❌ MySQL connection FAILED!")
        print(f"Error: {e}")
        print("")
        print("🔧 Troubleshooting:")
        print("1. Check if MySQL server is running")
        print("2. Verify IP, port, username, password")
        print("3. Check firewall settings")
        print("4. Ensure database exists")
        print("")
        return False

if __name__ == "__main__":
    print("🚀 Email Guardian - MySQL Connection Test")
    print("==========================================")
    print("")
    
    success = test_mysql_connection()
    
    if success:
        print("✅ Ready to deploy Email Guardian!")
    else:
        print("❌ Please fix MySQL connection before deploying") 