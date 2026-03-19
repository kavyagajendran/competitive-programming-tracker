import requests
try:
    res = requests.get("https://codeforces.com/api/contest.list?gym=false", timeout=10)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"Contests count: {len(data['result'])}")
        before = [u for u in data['result'] if u['phase'] == 'BEFORE']
        print(f"Upcoming count: {len(before)}")
        if before:
            print(f"First upcoming: {before[0]['name']}")
except Exception as e:
    print(f"Error: {e}")
