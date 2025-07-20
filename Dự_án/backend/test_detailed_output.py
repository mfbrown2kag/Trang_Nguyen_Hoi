#!/usr/bin/env python3
"""
Detailed test script to verify data output for analysis, trends, and history
"""

import requests
import json
import time
from datetime import datetime

def test_detailed_output():
    """Test detailed data output for each component"""
    base_url = "http://localhost:8000"
    
    print("🔍 KIỂM TRA CHI TIẾT DỮ LIỆU XUẤT")
    print("=" * 60)
    
    # Test 1: Email Analysis Output
    print("\n1️⃣ KIỂM TRA PHÂN TÍCH EMAIL:")
    print("-" * 40)
    
    test_emails = [
        {
            "name": "Email An Toàn",
            "text": "Subject: Meeting Update\nFrom: john@company.com\n\nHi team, meeting tomorrow at 2 PM in conference room.",
            "expected": "An toàn"
        },
        {
            "name": "Email Lừa Đảo",
            "text": "Subject: CONGRATULATIONS! You won $1,000,000!\nFrom: lottery@fake.com\n\nClick here to claim your prize immediately!",
            "expected": "Lừa đảo"
        },
        {
            "name": "Email Spam",
            "text": "Subject: LIMITED TIME OFFER!\nFrom: deals@amazing.com\n\nBest deals available only today! Act now!",
            "expected": "Spam"
        }
    ]
    
    for email in test_emails:
        print(f"\n📧 {email['name']}:")
        try:
            response = requests.post(
                f"{base_url}/api/analyze",
                json={"text": email["text"]}
            )
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Kết quả: {result['classification']}")
                print(f"   ✅ Độ tin cậy: {result['confidence']:.2f}")
                print(f"   ✅ Điểm rủi ro: {result['risk_score']}")
                print(f"   ✅ Thời gian xử lý: {result['processing_time']}ms")
                print(f"   ✅ Giải thích: {result['explanation'][:100]}...")
                
                # Check if classification matches expected
                if result['classification'] == email['expected']:
                    print(f"   🎯 ĐÚNG: Phân loại khớp với mong đợi")
                else:
                    print(f"   ⚠️ KHÁC: Mong đợi '{email['expected']}' nhưng nhận '{result['classification']}'")
            else:
                print(f"   ❌ Lỗi: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Lỗi: {e}")
    
    # Wait for database to update
    time.sleep(2)
    
    # Test 2: Dashboard Stats Output
    print("\n\n2️⃣ KIỂM TRA THỐNG KÊ DASHBOARD:")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/api/dashboard/stats")
        if response.status_code == 200:
            stats = response.json()
            print("📊 Thống kê tổng quan:")
            print(f"   📈 Tổng email đã phân tích: {stats.get('total_analyzed', 0)}")
            print(f"   ✅ Email an toàn: {stats.get('safe_emails', 0)}")
            print(f"   🚫 Email lừa đảo: {stats.get('phishing_blocked', 0)}")
            print(f"   📧 Email spam: {stats.get('spam_detected', 0)}")
            print(f"   ⚠️ Email đáng ngờ: {stats.get('suspicious_emails', 0)}")
            print(f"   🎯 Độ tin cậy trung bình: {stats.get('avg_confidence', 0)}%")
            print(f"   ⏱️ Thời gian xử lý trung bình: {stats.get('avg_processing_time', 0)}ms")
            print(f"   📊 Tỷ lệ thành công: {stats.get('success_rate', 0)}%")
        else:
            print(f"❌ Lỗi thống kê: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    
    # Test 3: Trend Data Output
    print("\n\n3️⃣ KIỂM TRA DỮ LIỆU TREND:")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/api/dashboard/trends?period=week")
        if response.status_code == 200:
            trends = response.json()
            print("📈 Dữ liệu trend (7 ngày):")
            print(f"   📅 Số ngày: {len(trends.get('labels', []))}")
            print(f"   📅 Nhãn thời gian: {trends.get('labels', [])}")
            print(f"   ✅ Dữ liệu an toàn: {trends.get('safe', [])}")
            print(f"   🚫 Dữ liệu lừa đảo: {trends.get('phishing', [])}")
            print(f"   📧 Dữ liệu spam: {trends.get('spam', [])}")
            print(f"   ⚠️ Dữ liệu đáng ngờ: {trends.get('suspicious', [])}")
            
            # Check if data is meaningful
            total_safe = sum(trends.get('safe', []))
            total_phishing = sum(trends.get('phishing', []))
            total_spam = sum(trends.get('spam', []))
            total_suspicious = sum(trends.get('suspicious', []))
            
            print(f"\n   📊 Tổng kết trend:")
            print(f"      An toàn: {total_safe}")
            print(f"      Lừa đảo: {total_phishing}")
            print(f"      Spam: {total_spam}")
            print(f"      Đáng ngờ: {total_suspicious}")
        else:
            print(f"❌ Lỗi trend: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    
    # Test 4: Distribution Data Output
    print("\n\n4️⃣ KIỂM TRA DỮ LIỆU PHÂN BỐ:")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/api/dashboard/distribution?period=week")
        if response.status_code == 200:
            distribution = response.json()
            print("🥧 Dữ liệu phân bố (biểu đồ tròn):")
            for classification, count in distribution.items():
                icon = {
                    'safe': '✅',
                    'spam': '📧', 
                    'phishing': '🚫',
                    'suspicious': '⚠️'
                }.get(classification, '📊')
                print(f"   {icon} {classification}: {count}")
            
            # Calculate percentages
            total = sum(distribution.values())
            if total > 0:
                print(f"\n   📊 Phần trăm:")
                for classification, count in distribution.items():
                    percentage = (count / total) * 100
                    print(f"      {classification}: {percentage:.1f}%")
        else:
            print(f"❌ Lỗi phân bố: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    
    # Test 5: History Data Output
    print("\n\n5️⃣ KIỂM TRA DỮ LIỆU LỊCH SỬ:")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/api/history?limit=10")
        if response.status_code == 200:
            history_data = response.json()
            history = history_data.get('history', [])
            print(f"📚 Lịch sử phân tích ({len(history)} bản ghi):")
            
            if history:
                for i, record in enumerate(history[:5], 1):
                    print(f"\n   📝 Bản ghi {i}:")
                    print(f"      🆔 ID: {record.get('id', 'N/A')}")
                    print(f"      📧 Nội dung: {record.get('text', 'N/A')[:80]}...")
                    print(f"      🏷️ Phân loại: {record.get('classification', 'N/A')}")
                    print(f"      🎯 Độ tin cậy: {record.get('confidence', 0):.2f}")
                    print(f"      ⏰ Thời gian: {record.get('timestamp', 'N/A')}")
                    print(f"      ⏱️ Thời gian xử lý: {record.get('processing_time', 0)}ms")
            else:
                print("   ⚠️ Không có bản ghi lịch sử")
        else:
            print(f"❌ Lỗi lịch sử: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    
    # Test 6: Activity Feed Output
    print("\n\n6️⃣ KIỂM TRA FEED HOẠT ĐỘNG:")
    print("-" * 40)
    
    try:
        response = requests.get(f"{base_url}/api/analysis/activity?limit=5")
        if response.status_code == 200:
            activity = response.json()
            print(f"🔄 Feed hoạt động ({len(activity)} hoạt động):")
            
            if activity:
                for i, act in enumerate(activity[:3], 1):
                    print(f"\n   🔄 Hoạt động {i}:")
                    print(f"      🆔 ID: {act.get('id', 'N/A')}")
                    print(f"      📧 Email: {act.get('email_text', 'N/A')[:80]}...")
                    print(f"      🏷️ Phân loại: {act.get('classification', 'N/A')}")
                    print(f"      🎯 Độ tin cậy: {act.get('confidence', 0):.2f}")
                    print(f"      ⏰ Thời gian: {act.get('timestamp', 'N/A')}")
                    print(f"      ⏱️ Thời gian xử lý: {act.get('processing_time', 0)}ms")
            else:
                print("   ⚠️ Không có hoạt động nào")
        else:
            print(f"❌ Lỗi feed: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    
    # Test 7: Database Consistency Check
    print("\n\n7️⃣ KIỂM TRA TÍNH NHẤT QUÁN DỮ LIỆU:")
    print("-" * 40)
    
    try:
        # Get stats from different endpoints
        stats_response = requests.get(f"{base_url}/api/dashboard/stats")
        history_response = requests.get(f"{base_url}/api/history?limit=100")
        
        if stats_response.status_code == 200 and history_response.status_code == 200:
            stats = stats_response.json()
            history_data = history_response.json()
            history = history_data.get('history', [])
            
            total_from_stats = stats.get('total_analyzed', 0)
            total_from_history = len(history)
            
            print(f"📊 So sánh số lượng:")
            print(f"   📈 Từ thống kê: {total_from_stats}")
            print(f"   📚 Từ lịch sử: {total_from_history}")
            
            if total_from_stats == total_from_history:
                print("   ✅ NHẤT QUÁN: Số lượng khớp nhau")
            else:
                print("   ⚠️ KHÔNG NHẤT QUÁN: Số lượng khác nhau")
                
            # Check classification distribution
            if history:
                classifications = {}
                for record in history:
                    classification = record.get('classification', 'Unknown')
                    classifications[classification] = classifications.get(classification, 0) + 1
                
                print(f"\n   📊 Phân bố từ lịch sử:")
                for classification, count in classifications.items():
                    print(f"      {classification}: {count}")
        else:
            print("❌ Không thể kiểm tra tính nhất quán")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 KIỂM TRA CHI TIẾT HOÀN TẤT!")
    print("📊 Tất cả dữ liệu đã được kiểm tra và xuất ra")

if __name__ == "__main__":
    test_detailed_output() 