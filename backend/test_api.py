import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    response = requests.get(f"{BASE_URL}/health")
    print("✅ Health Check:", response.json())

def test_create_user():
    data = {
        "name": "Alice Johnson",
        "age": 28,
        "description": "My skin is combination type. I have an oily T-zone but dry cheeks. I struggle with occasional breakouts on my forehead and some dark spots from old acne. I'm also sensitive to fragrances."
    }
    
    response = requests.post(f"{BASE_URL}/api/users/create-from-description", json=data)
    result = response.json()
    print("\n✅ User Created:")
    print(json.dumps(result, indent=2))
    return result["user_id"]

def test_chat(user_id):
    data = {
        "user_id": user_id,
        "message": "What ingredients should I avoid?"
    }
    
    response = requests.post(f"{BASE_URL}/api/chat", json=data)
    result = response.json()
    print("\n✅ Chat Response:")
    print(json.dumps(result, indent=2))

def test_scan_product(user_id):
    data = {
        "barcode": "123456789",
        "user_id": user_id
    }
    
    response = requests.post(f"{BASE_URL}/api/products/scan", json=data)
    result = response.json()
    print("\n✅ Product Analysis:")
    print(json.dumps(result, indent=2))

def test_generate_routine(user_id):
    response = requests.post(f"{BASE_URL}/api/routine/generate?user_id={user_id}&budget=mid-range")
    result = response.json()
    print("\n✅ Generated Routine:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    print("🧪 Testing Skincare AI API...\n")
    
    # Run tests
    test_health()
    user_id = test_create_user()
    test_chat(user_id)
    test_scan_product(user_id)
    test_generate_routine(user_id)
    
    print("\n✅ All tests completed!")
