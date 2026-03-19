import requests
import json

url = "https://codeforces.com/api/contest.list?gym=false"
try:
    res = requests.get(url, timeout=15)
    if res.status_code == 200:
        data = res.json()
        if data['status'] == 'OK':
            contests = data['result']
            for c in contests:
                if "187" in c['name']:
                    print(json.dumps(c, indent=2))
        else:
            print("API Error:", data.get('comment'))
    else:
        print("HTTP Error:", res.status_code)
except Exception as e:
    print("Error:", e)
