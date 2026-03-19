import requests
import json

def test_compete_api():
    url = "https://competeapi.vercel.app/contests/leetcode/"
    print(f"Testing {url}...")
    try:
        res = requests.get(url, timeout=10)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print("Response:", json.dumps(data, indent=2))
        else:
            print("Failed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_compete_api()
