import requests
import time

BASE_URL = 'http://localhost:5000/api'

def test_admin():
    print("--- Verifying Admin System ---")

    # 1. Login as Admin
    print("\n1. Logging in as Admin (Kavya@24)...")
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"username": "Kavya@24", "password": "123456789"})
        if res.status_code == 200:
            print("   SUCCESS: Admin Login")
            admin_token = res.json().get('token')
        else:
            print(f"   FAILED: {res.status_code} {res.text}")
            return
    except Exception as e:
        print(f"   ERROR: {e}")
        return

    # 2. Access Admin API as Admin
    print("\n2. Accessing Admin Stats as Admin...")
    try:
        res = requests.get(f"{BASE_URL}/admin/users", headers={'x-admin-user': 'Kavya@24'})
        if res.status_code == 200:
            stats = res.json()
            print(f"   SUCCESS: Retrieved stats for {len(stats)} users")
            for user in stats:
                print(f"   - {user['username']}: Logins={user['totalLogins']}, Last={user['lastLogin']}")
        else:
            print(f"   FAILED: {res.status_code} {res.text}")
    except Exception as e:
        print(f"   ERROR: {e}")

    # 3. Access Admin API as Regular User (Spoofing)
    print("\n3. Accessing Admin Stats as Regular User (Spoofing)...")
    try:
        res = requests.get(f"{BASE_URL}/admin/users", headers={'x-admin-user': 'NotAdmin'})
        if res.status_code == 403:
            print("   SUCCESS: Access Denied (Expected)")
        else:
            print(f"   FAILED: Expected 403, got {res.status_code}")
    except Exception as e:
        print(f"   ERROR: {e}")

if __name__ == "__main__":
    test_admin()
