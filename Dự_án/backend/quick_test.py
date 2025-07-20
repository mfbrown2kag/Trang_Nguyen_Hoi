#!/usr/bin/env python3
"""
Quick test to check current data output status
"""

import requests
import json

def quick_test():
    """Quick test of current system status"""
    base_url = "http://localhost:8000"
    
    print("🔍 QUICK TEST - Current System Status")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            print("✅ Server: Running")
        else:
            print("❌ Server: Not responding")
            return
    except:
        print("❌ Server: Cannot connect")
        return
    
    # Test 2: Dashboard stats
    try:
        response = requests.get(f"{base_url}/api/dashboard/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Dashboard Stats: {stats.get('total_analyzed', 0)} emails")
            print(f"   Safe: {stats.get('safe_emails', 0)}")
            print(f"   Phishing: {stats.get('phishing_blocked', 0)}")
            print(f"   Spam: {stats.get('spam_detected', 0)}")
            print(f"   Suspicious: {stats.get('suspicious_emails', 0)}")
        else:
            print("❌ Dashboard Stats: Error")
    except Exception as e:
        print(f"❌ Dashboard Stats: {e}")
    
    # Test 3: History
    try:
        response = requests.get(f"{base_url}/api/history?limit=5")
        if response.status_code == 200:
            data = response.json()
            history = data.get('history', [])
            print(f"✅ History: {len(history)} records")
            if history:
                print(f"   Latest: {history[0].get('classification', 'Unknown')}")
        else:
            print("❌ History: Error")
    except Exception as e:
        print(f"❌ History: {e}")
    
    # Test 4: Activity feed
    try:
        response = requests.get(f"{base_url}/api/analysis/activity?limit=3")
        if response.status_code == 200:
            activity = response.json()
            print(f"✅ Activity Feed: {len(activity)} activities")
            if activity:
                print(f"   Latest: {activity[0].get('classification', 'Unknown')}")
        else:
            print("❌ Activity Feed: Error")
    except Exception as e:
        print(f"❌ Activity Feed: {e}")
    
    # Test 5: Distribution
    try:
        response = requests.get(f"{base_url}/api/dashboard/distribution")
        if response.status_code == 200:
            distribution = response.json()
            print("✅ Distribution:")
            for key, value in distribution.items():
                print(f"   {key}: {value}")
        else:
            print("❌ Distribution: Error")
    except Exception as e:
        print(f"❌ Distribution: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Quick test complete!")

if __name__ == "__main__":
    quick_test() 