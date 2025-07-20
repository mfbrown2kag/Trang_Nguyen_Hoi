#!/usr/bin/env python3
"""
Test script to verify data flow from API to database and back
"""

import requests
import json
import time
from datetime import datetime

def test_data_flow():
    """Test the complete data flow"""
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Email Guardian Data Flow")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing server health...")
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Server is running: {health}")
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Test 2: Send test email for analysis
    print("\n2️⃣ Testing email analysis...")
    test_email = """
    Subject: Urgent Account Verification Required
    From: security@yourbank.com
    
    Dear Customer,
    
    Your account has been suspended due to suspicious activity.
    Please click here immediately to verify your identity:
    http://fake-bank-verify.com
    
    This is urgent and requires immediate attention.
    """
    
    try:
        response = requests.post(
            f"{base_url}/api/analyze",
            json={"text": test_email}
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Analysis completed:")
            print(f"   Classification: {result['classification']}")
            print(f"   Confidence: {result['confidence']}")
            print(f"   Risk Score: {result['risk_score']}")
            print(f"   Processing Time: {result['processing_time']}ms")
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Analysis request failed: {e}")
        return
    
    # Wait a moment for database to update
    time.sleep(1)
    
    # Test 3: Check dashboard stats
    print("\n3️⃣ Testing dashboard stats...")
    try:
        response = requests.get(f"{base_url}/api/dashboard/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Dashboard stats:")
            print(f"   Total Analyzed: {stats.get('total_analyzed', 0)}")
            print(f"   Spam Detected: {stats.get('spam_detected', 0)}")
            print(f"   Phishing Blocked: {stats.get('phishing_blocked', 0)}")
            print(f"   Safe Emails: {stats.get('safe_emails', 0)}")
            print(f"   Avg Confidence: {stats.get('avg_confidence', 0)}")
        else:
            print(f"❌ Dashboard stats failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard stats request failed: {e}")
    
    # Test 4: Check history
    print("\n4️⃣ Testing history endpoint...")
    try:
        response = requests.get(f"{base_url}/api/history?limit=10")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ History retrieved: {len(history)} records")
            if history:
                print("   Recent records:")
                for i, record in enumerate(history[:3]):
                    print(f"   {i+1}. {record.get('classification', 'Unknown')} - {record.get('text', '')[:50]}...")
            else:
                print("   ⚠️ No history records found")
        else:
            print(f"❌ History request failed: {response.status_code}")
    except Exception as e:
        print(f"❌ History request failed: {e}")
    
    # Test 5: Check dashboard trends
    print("\n5️⃣ Testing dashboard trends...")
    try:
        response = requests.get(f"{base_url}/api/dashboard/trends")
        if response.status_code == 200:
            trends = response.json()
            print(f"✅ Trends retrieved: {len(trends)} data points")
        else:
            print(f"❌ Trends request failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Trends request failed: {e}")
    
    # Test 6: Check distribution
    print("\n6️⃣ Testing dashboard distribution...")
    try:
        response = requests.get(f"{base_url}/api/dashboard/distribution")
        if response.status_code == 200:
            distribution = response.json()
            print(f"✅ Distribution retrieved:")
            for classification, count in distribution.items():
                print(f"   {classification}: {count}")
        else:
            print(f"❌ Distribution request failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Distribution request failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Data Flow Test Complete!")

if __name__ == "__main__":
    test_data_flow() 