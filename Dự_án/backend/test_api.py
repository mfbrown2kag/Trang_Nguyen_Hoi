#!/usr/bin/env python3
"""
Test script to call API and create data
"""

import requests
import json
import time

def test_api():
    print("🧪 Testing API and creating data...")
    
    # Test emails
    test_emails = [
        {
            "text": "CONGRATULATIONS! You have won $1,000,000! Click here to claim your prize: http://fake-lottery.com",
            "expected": "Lừa đảo"
        },
        {
            "text": "Hi John, just wanted to follow up on our conversation yesterday about the project timeline.",
            "expected": "An toàn"
        },
        {
            "text": "Your account has been suspended. Please verify your credentials immediately by clicking this link.",
            "expected": "Lừa đảo"
        },
        {
            "text": "Limited time offer! Best deals available only today. Act now before it's too late!",
            "expected": "Spam"
        },
        {
            "text": "Meeting update for tomorrow at 2 PM in conference room B. Please bring the financial reports.",
            "expected": "An toàn"
        }
    ]
    
    for i, email in enumerate(test_emails, 1):
        try:
            print(f"\n📧 Testing email {i}: {email['text'][:50]}...")
            
            response = requests.post(
                "http://localhost:8000/api/analyze",
                headers={"Content-Type": "application/json"},
                json={"text": email["text"]},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {result['classification']} (Expected: {email['expected']})")
                print(f"   Confidence: {result['confidence']:.2f}")
                print(f"   Processing time: {result['processing_time']}ms")
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
        
        time.sleep(1)  # Wait between requests
    
    print("\n🎯 Testing dashboard endpoints...")
    
    # Test dashboard stats
    try:
        response = requests.get("http://localhost:8000/api/dashboard/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Dashboard stats: {stats}")
        else:
            print(f"❌ Dashboard stats error: {response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard stats exception: {e}")
    
    # Test history
    try:
        response = requests.get("http://localhost:8000/api/history?limit=5")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ History: {len(history.get('history', []))} records")
        else:
            print(f"❌ History error: {response.status_code}")
    except Exception as e:
        print(f"❌ History exception: {e}")

if __name__ == "__main__":
    test_api() 