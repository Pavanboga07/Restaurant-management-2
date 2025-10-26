import requests
import json

# Test login API
url = "http://localhost:8000/api/auth/login"
data = {
    "username": "chef",
    "password": "chef123"
}

print("🧪 Testing Login API...")
print(f"URL: {url}")
print(f"Credentials: {data['username']}/{data['password']}")
print("-" * 50)

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        result = response.json()
        print(f"\nToken Type: {result.get('token_type')}")
        print(f"Access Token: {result.get('access_token')[:50]}...")
        print(f"\nUser Info:")
        user = result.get('user', {})
        print(f"  Username: {user.get('username')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Full Name: {user.get('full_name')}")
        print(f"  Role: {user.get('role')}")
        print(f"  Active: {user.get('is_active')}")
    else:
        print("❌ Login failed!")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
