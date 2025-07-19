#!/usr/bin/env python3
"""
Deployment Test Script for Email Guardian Backend
Tests all dependencies and functionality before server deployment
"""

import sys
import os
import importlib
import traceback
from pathlib import Path

def test_imports():
    """Test all required imports"""
    print("🔍 Testing imports...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'pandas',
        'numpy',
        'textblob',
        'nltk',
        'plotly',
        'wordcloud',
        'matplotlib',
        'seaborn',
        'google.genai',
        'dotenv',
        'pickle'
    ]
    
    failed_imports = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\n❌ Failed imports: {failed_imports}")
        return False
    else:
        print("✅ All imports successful!")
        return True

def test_model_file():
    """Test if model file exists and can be loaded"""
    print("\n🔍 Testing model file...")
    
    model_paths = [
        "model/model_check_email.pkl",
        "backend/model/model_check_email.pkl",
        "../model/model_check_email.pkl"
    ]
    
    for path in model_paths:
        if os.path.exists(path):
            print(f"✅ Model found at: {path}")
            try:
                import pickle
                with open(path, 'rb') as f:
                    model = pickle.load(f)
                print(f"✅ Model loaded successfully (type: {type(model)})")
                return True
            except Exception as e:
                print(f"❌ Failed to load model: {e}")
                return False
    
    print("❌ Model file not found in any expected location")
    return False

def test_config_files():
    """Test if configuration files exist"""
    print("\n🔍 Testing configuration files...")
    
    config_files = [
        "config.env",
        "config.env.example",
        "requirements.txt"
    ]
    
    all_exist = True
    for file in config_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - MISSING")
            all_exist = False
    
    return all_exist

def test_core_logic():
    """Test core logic functionality"""
    print("\n🔍 Testing core logic...")
    
    try:
        # Add app directory to path
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        
        from app.core_logic import get_analyzer
        
        analyzer = get_analyzer()
        print("✅ Analyzer initialized")
        
        # Test with sample email
        test_email = "Hello, this is a test email. Please verify your account."
        result = analyzer.analyze_email(test_email)
        
        required_keys = ['classification', 'confidence', 'explanation', 'features', 'risk_score', 'recommendations']
        for key in required_keys:
            if key in result:
                print(f"✅ {key}: {result[key]}")
            else:
                print(f"❌ Missing key: {key}")
                return False
        
        print("✅ Core logic test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Core logic test failed: {e}")
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🔍 Testing API endpoints...")
    
    try:
        from api_server import app
        print("✅ FastAPI app imported")
        
        # Test root endpoint
        from fastapi.testclient import TestClient
        client = TestClient(app)
        
        response = client.get("/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
        
        # Test health endpoint
        response = client.get("/api/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        print("✅ API endpoints test passed!")
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {e}")
        traceback.print_exc()
        return False

def test_directory_structure():
    """Test if all required directories exist"""
    print("\n🔍 Testing directory structure...")
    
    required_dirs = [
        "app",
        "model",
        "app/__pycache__"  # This will be created automatically
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✅ {dir_path}/")
        else:
            print(f"❌ {dir_path}/ - MISSING")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🚀 Email Guardian Backend - Deployment Test")
    print("=" * 50)
    
    tests = [
        ("Directory Structure", test_directory_structure),
        ("Configuration Files", test_config_files),
        ("Model File", test_model_file),
        ("Imports", test_imports),
        ("Core Logic", test_core_logic),
        ("API Endpoints", test_api_endpoints)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Ready for deployment!")
        return True
    else:
        print("⚠️  Some tests failed. Please fix issues before deployment.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 