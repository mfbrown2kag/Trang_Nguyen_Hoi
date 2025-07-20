"""
Database Connection - MySQL cho giám khảo
========================================

Module kết nối MySQL database cho Email Guardian.
Tối ưu cho kết nối database của giám khảo.
"""

import mysql.connector
import logging
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

# Setup logging
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

class DatabaseManager:
    """Quản lý kết nối MySQL database"""
    
    def __init__(self):
        """Khởi tạo database manager"""
        self.connection = None
        self.cursor = None
        self._connect()
    
    def _connect(self):
        """Kết nối MySQL database"""
        try:
            # Load config
            config = load_config()
            
            # Cấu hình MySQL - từ config.env hoặc default
            db_config = {
                'host': config.get('DB_HOST', '62.146.236.71'),
                'user': config.get('DB_USER', 'trang-nguyen-hoi'),
                'password': config.get('DB_PASSWORD', 'HCfibCPw4snScdSA'),
                'database': config.get('DB_NAME', 'email_guardian'),
                'port': int(config.get('DB_PORT', 3306)),
                'charset': 'utf8mb4',
                'autocommit': True,
                'connect_timeout': 10,
                'use_unicode': True
            }
            
            logger.info(f"🔗 Connecting to MySQL: {db_config['host']}:{db_config['port']}")
            logger.info(f"👤 User: {db_config['user']}")
            logger.info(f"🗄️ Database: {db_config['database']}")
            
            self.connection = mysql.connector.connect(**db_config)
            self.cursor = self.connection.cursor(dictionary=True)
            
            logger.info("✅ MySQL database connected successfully")
            
            # Tạo bảng nếu chưa có
            self._create_tables()
            
        except mysql.connector.Error as e:
            logger.error(f"❌ MySQL connection failed: {e}")
            self.connection = None
            self.cursor = None
    
    def _create_tables(self):
        """Tạo các bảng cần thiết"""
        try:
            if not self.cursor:
                logger.warning("⚠️ No database cursor available")
                return
                
            # Bảng lưu kết quả phân tích email
            create_analysis_table = """
            CREATE TABLE IF NOT EXISTS email_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email_text TEXT NOT NULL,
                classification VARCHAR(50) NOT NULL,
                confidence FLOAT NOT NULL,
                explanation TEXT NOT NULL,
                risk_score INT NOT NULL,
                recommendations JSON,
                processing_time INT NOT NULL,
                ai_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_classification (classification),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            # Bảng lưu thống kê
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
            
            self.cursor.execute(create_analysis_table)
            self.cursor.execute(create_stats_table)
            
            logger.info("✅ Database tables created/verified")
            
        except mysql.connector.Error as e:
            logger.error(f"❌ Table creation failed: {e}")
    
    def save_analysis_result(self, analysis_data: Dict[str, Any]) -> bool:
        """
        Lưu kết quả phân tích vào database
        
        Args:
            analysis_data: Dữ liệu phân tích email
            
        Returns:
            True nếu lưu thành công, False nếu lỗi
        """
        try:
            if not self.connection or not self.cursor:
                logger.warning("⚠️ Database not connected")
                return False
            
            # Chuẩn bị dữ liệu
            recommendations_json = analysis_data.get('recommendations', [])
            if isinstance(recommendations_json, list):
                recommendations_json = ','.join(recommendations_json)
            
            # Insert vào bảng email_analysis
            insert_query = """
            INSERT INTO email_analysis (
                email_text, classification, confidence, explanation,
                risk_score, recommendations, processing_time, ai_used
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                analysis_data.get('email_text', ''),
                analysis_data.get('classification', ''),
                analysis_data.get('confidence', 0.0),
                analysis_data.get('explanation', ''),
                analysis_data.get('risk_score', 0),
                recommendations_json,
                analysis_data.get('processing_time', 0),
                analysis_data.get('ai_used', False)
            )
            
            self.cursor.execute(insert_query, values)
            
            # Cập nhật thống kê
            self._update_daily_stats(analysis_data)
            
            logger.info("✅ Analysis result saved to database")
            return True
            
        except mysql.connector.Error as e:
            logger.error(f"❌ Save analysis failed: {e}")
            return False
    
    def _update_daily_stats(self, analysis_data: Dict[str, Any]):
        """Cập nhật thống kê hàng ngày"""
        try:
            if not self.cursor:
                return
                
            today = datetime.now().date()
            classification = analysis_data.get('classification', '')
            processing_time = analysis_data.get('processing_time', 0)
            ai_used = analysis_data.get('ai_used', False)
            
            # Kiểm tra xem đã có thống kê cho hôm nay chưa
            check_query = "SELECT * FROM analysis_stats WHERE date = %s"
            self.cursor.execute(check_query, (today,))
            existing_stats = self.cursor.fetchone()
            
            if existing_stats:
                # Cập nhật thống kê hiện có
                update_query = """
                UPDATE analysis_stats SET
                    total_emails = total_emails + 1,
                    safe_count = safe_count + %s,
                    spam_count = spam_count + %s,
                    phishing_count = phishing_count + %s,
                    malware_count = malware_count + %s,
                    suspicious_count = suspicious_count + %s,
                    avg_processing_time = (avg_processing_time * total_emails + %s) / (total_emails + 1),
                    ai_usage_count = ai_usage_count + %s
                WHERE date = %s
                """
                
                # Tính toán số lượng cho từng loại
                safe_count = 1 if classification == 'safe' else 0
                spam_count = 1 if classification == 'spam' else 0
                phishing_count = 1 if classification == 'phishing' else 0
                malware_count = 1 if classification == 'malware' else 0
                suspicious_count = 1 if classification == 'suspicious' else 0
                ai_usage = 1 if ai_used else 0
                
                values = (
                    safe_count, spam_count, phishing_count, malware_count, suspicious_count,
                    processing_time, ai_usage, today
                )
                
                self.cursor.execute(update_query, values)
                
            else:
                # Tạo thống kê mới cho hôm nay
                insert_query = """
                INSERT INTO analysis_stats (
                    date, total_emails, safe_count, spam_count, phishing_count,
                    malware_count, suspicious_count, avg_processing_time, ai_usage_count
                ) VALUES (%s, 1, %s, %s, %s, %s, %s, %s, %s)
                """
                
                safe_count = 1 if classification == 'safe' else 0
                spam_count = 1 if classification == 'spam' else 0
                phishing_count = 1 if classification == 'phishing' else 0
                malware_count = 1 if classification == 'malware' else 0
                suspicious_count = 1 if classification == 'suspicious' else 0
                ai_usage = 1 if ai_used else 0
                
                values = (
                    today, safe_count, spam_count, phishing_count, 
                    malware_count, suspicious_count, processing_time, ai_usage
                )
                
                self.cursor.execute(insert_query, values)
                
        except mysql.connector.Error as e:
            logger.error(f"❌ Update stats failed: {e}")
    
    def get_recent_analyses(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Lấy danh sách phân tích gần đây
        
        Args:
            limit: Số lượng kết quả trả về
            
        Returns:
            List các kết quả phân tích
        """
        try:
            if not self.connection or not self.cursor:
                return []
            
            query = """
            SELECT * FROM email_analysis 
            ORDER BY created_at DESC 
            LIMIT %s
            """
            
            self.cursor.execute(query, (limit,))
            results = self.cursor.fetchall()
            
            return results
            
        except mysql.connector.Error as e:
            logger.error(f"❌ Get recent analyses failed: {e}")
            return []
    
    def get_daily_stats(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Lấy thống kê hàng ngày
        
        Args:
            days: Số ngày lấy thống kê
            
        Returns:
            List thống kê hàng ngày
        """
        try:
            if not self.connection or not self.cursor:
                return []
            
            query = """
            SELECT * FROM analysis_stats 
            ORDER BY date DESC 
            LIMIT %s
            """
            
            self.cursor.execute(query, (days,))
            results = self.cursor.fetchall()
            
            return results
            
        except mysql.connector.Error as e:
            logger.error(f"❌ Get daily stats failed: {e}")
            return []
    
    def get_classification_stats(self) -> Dict[str, int]:
        """
        Lấy thống kê phân loại
        
        Returns:
            Dict với số lượng từng loại
        """
        try:
            if not self.connection or not self.cursor:
                return {}
            
            query = """
            SELECT classification, COUNT(*) as count 
            FROM email_analysis 
            GROUP BY classification
            """
            
            self.cursor.execute(query)
            results = self.cursor.fetchall()
            
            stats = {}
            for row in results:
                stats[row['classification']] = row['count']
            
            return stats
            
        except mysql.connector.Error as e:
            logger.error(f"❌ Get classification stats failed: {e}")
            return {}
    
    def close(self):
        """Đóng kết nối database"""
        try:
            if self.cursor:
                self.cursor.close()
            if self.connection:
                self.connection.close()
            logger.info("✅ Database connection closed")
        except Exception as e:
            logger.error(f"❌ Close database failed: {e}")

# Global database instance
db_manager = None

def get_database():
    """Lấy instance database manager"""
    global db_manager
    if db_manager is None:
        db_manager = DatabaseManager()
    return db_manager 