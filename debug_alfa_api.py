import requests
import json

def test_alfa_api():
    url = "https://alfa-leetcode-api.onrender.com/upcomingContests"
    print(f"Testing {url}...")
    try:
        res = requests.get(url, timeout=15)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print("Response:", json.dumps(data, indent=2))
        else:
            print(f"Failed with status {res.status_code}")
            print(f"Body: {res.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_alfa_api()
