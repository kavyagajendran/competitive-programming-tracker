import requests
import json
import sys

# Redirect stdout to a file for easier reading
sys.stdout = open('verify_output.txt', 'w')

BASE_URL = 'http://localhost:5000/api'
ADMIN_USER = 'Kavya@24'
ADMIN_PASS = '123456789'

def login(username, password, department):
    try:
        res = requests.post(f'{BASE_URL}/auth/login', json={
            'username': username,
            'password': password,
            'department': department
        })
        return res
    except Exception as e:
        print(f"Login connection failed: {e}")
        return None

def main():
    print("--- Verifying Department Segregation ---")

    # 1. Admin Login (AIML)
    print("\n1. Admin Login (AIML)...")
    res = login(ADMIN_USER, ADMIN_PASS, 'AIML')
    if res.status_code != 200:
        print(f"FAILED: Admin login AIML. {res.text}")
        return
    token_aiml = res.json()['token']
    print("SUCCESS")

    # 2. Create Users (AIML & CSE)
    print("\n2. Creating Users...")
    headers_aiml = {
        'x-admin-user': ADMIN_USER,
        'x-department-context': 'AIML',
        'Content-Type': 'application/json'
    }
    
    # Create staff_aiml
    requests.post(f'{BASE_URL}/admin/create-user', headers=headers_aiml, json={
        'username': 'staff_aiml',
        'password': 'password123',
        'role': 'staff',
        'department': 'AIML'
    })
    
    # Create staff_cse
    requests.post(f'{BASE_URL}/admin/create-user', headers=headers_aiml, json={
        'username': 'staff_cse',
        'password': 'password123',
        'role': 'staff',
        'department': 'CSE'
    })
    print("Users created (ignoring duplicates)")

    # 3. Verify Admin View (AIML Context)
    print("\n3. Verify Admin View (AIML Context)...")
    res = requests.get(f'{BASE_URL}/admin/users', headers=headers_aiml)
    users = res.json()
    aiml_users = [u['username'] for u in users]
    print(f"Users in AIML context: {aiml_users}")
    
    if 'staff_aiml' in aiml_users and 'staff_cse' not in aiml_users:
        print("SUCCESS: Only AIML users visible.")
    else:
        print("FAILED: Visibility check failed for AIML context.")
        # Note: If admin sees ALL in my logic it might fail. Let's check logic.
        # My logic: if (deptContext) users = users.filter(u => u.department === deptContext);
        # So it SHOULD filter.

    # 4. Verify Admin View (CSE Context)
    print("\n4. Verify Admin View (CSE Context)...")
    headers_cse = {
        'x-admin-user': ADMIN_USER,
        'x-department-context': 'CSE',
        'Content-Type': 'application/json'
    }
    res = requests.get(f'{BASE_URL}/admin/users', headers=headers_cse)
    users = res.json()
    cse_users = [u['username'] for u in users]
    print(f"Users in CSE context: {cse_users}")

    if 'staff_cse' in cse_users and 'staff_aiml' not in cse_users:
        print("SUCCESS: Only CSE users visible.")
    else:
        print("FAILED: Visibility check failed for CSE context.")

    # 5. Post Announcement (AIML)
    print("\n5. Post Announcement (AIML)...")
    requests.post(f'{BASE_URL}/announcements', headers=headers_aiml, json={
        'title': 'AIML Info',
        'content': 'For AIML only',
        'department': 'AIML'
    })
    
    # 6. Post Announcement (CSE)
    print("\n6. Post Announcement (CSE)...")
    requests.post(f'{BASE_URL}/announcements', headers=headers_cse, json={
        'title': 'CSE Info',
        'content': 'For CSE only',
        'department': 'CSE'
    })

    # 7. Verify Announcement Isolation
    print("\n7. Verify Announcement Isolation...")
    # Fetch as AIML context
    res = requests.get(f'{BASE_URL}/announcements', headers={'x-department-context': 'AIML'})
    anns = res.json()
    titles = [a['title'] for a in anns]
    print(f"AIML Context Announcements: {titles}")
    if 'AIML Info' in titles and 'CSE Info' not in titles:
        print("SUCCESS: AIML Isolation verification passed.")
    else:
        print("FAILED: AIML Isolation verification passed.")

    # 8. Login Segregation
    print("\n8. Login Segregation...")
    # staff_aiml login to AIML -> OK
    res = login('staff_aiml', 'password123', 'AIML')
    if res.status_code == 200:
        print("SUCCESS: staff_aiml logged into AIML.")
    else:
        print(f"FAILED: staff_aiml login AIML. {res.status_code}")

    # staff_aiml login to CSE -> Fail
    res = login('staff_aiml', 'password123', 'CSE')
    if res.status_code == 403:
        print("SUCCESS: staff_aiml denied access to CSE.")
    else:
        print(f"FAILED: staff_aiml login CSE allowed? {res.status_code}")

if __name__ == '__main__':
    main()
