import requests
import time

BASE_URL = 'http://localhost:5000/api/auth'

def test_auth():
    username = f"testuser_{int(time.time())}"
    password = "password123"

    print(f"Testing Auth for user: {username}")

    # 1. Signup
    print("1. Testing Signup...")
    try:
        res = requests.post(f"{BASE_URL}/signup", json={"username": username, "password": password})
        if res.status_code == 200:
            print("   Signup Success!")
        else:
            print(f"   Signup Failed: {res.status_code} {res.text}")
            return
    except Exception as e:
        print(f"   Signup Error: {e}")
        return

    # 2. Login
    print("2. Testing Login...")
    try:
        res = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
        if res.status_code == 200:
            print("   Login Success!")
            token = res.json().get('token')
            print(f"   Token received: {token[:20]}...")
        else:
            print(f"   Login Failed: {res.status_code} {res.text}")
            return
    except Exception as e:
        print(f"   Login Error: {e}")
        return

if __name__ == "__main__":
    test_auth()
