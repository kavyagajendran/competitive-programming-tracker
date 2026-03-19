import requests
import json
from datetime import datetime

url = "https://codeforces.com/api/contest.list?gym=false"
try:
    res = requests.get(url, timeout=15)
    if res.status_code == 200:
        data = res.json()
        if data['status'] == 'OK':
            contests = data['result']
            for c in contests:
                if c['id'] in [2203, 2204]:
                    dt = datetime.fromtimestamp(c['startTimeSeconds'])
                    print(f"ID: {c['id']}, Name: {c['name']}, Phase: {c['phase']}, StartTime: {dt.isoformat()}")
        else:
            print("API Error:", data.get('comment'))
    else:
        print("HTTP Error:", res.status_code)
except Exception as e:
    print("Error:", e)
