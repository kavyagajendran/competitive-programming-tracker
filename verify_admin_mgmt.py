import requests

BASE_URL = 'http://localhost:5000/api'

def test_admin_features():
    print("--- Verifying Admin-Only Management ---")

    # 1. Test Public Signup (Should Block/Fail/Removed)
    print("\n1. Testing Public Signup (Should Fail 404)...")
    try:
        res = requests.post(f"{BASE_URL}/auth/signup", json={"username": "bad", "password": "123"})
        if res.status_code == 404:
            print("   SUCCESS: Signup Endpoint Not Found (Removed)")
        else: # Depending on express, might be 404 if removed from routes
            print(f"   Note: Got {res.status_code} {res.text} (If 404, Good)")
    except Exception as e:
        print(f"   ERROR: {e}")

    # 2. Admin Create User
    print("\n2. Admin Creating User 'helper' (Role: user)...")
    try:
        res = requests.post(f"{BASE_URL}/admin/create-user", 
            json={"username": "helper", "password": "123", "role": "user"},
            headers={'x-admin-user': 'Kavya@24'})
        if res.status_code == 200:
            print("   SUCCESS: User 'helper' created")
        elif res.status_code == 409:
             print("   SUCCESS: User 'helper' already exists")
        else:
            print(f"   FAILED: {res.status_code} {res.text}")
    except Exception as e:
        print(f"   ERROR: {e}")

    # 3. Admin Delete User
    print("\n3. Admin Deleting User 'helper'...")
    try:
        res = requests.delete(f"{BASE_URL}/admin/users/helper", headers={'x-admin-user': 'Kavya@24'})
        if res.status_code == 200:
            print("   SUCCESS: User 'helper' deleted")
        else:
            print(f"   FAILED: {res.status_code} {res.text}")
    except Exception as e:
        print(f"   ERROR: {e}")

if __name__ == "__main__":
    test_admin_features()
