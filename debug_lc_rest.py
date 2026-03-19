import requests
import json

def test_lc_rest():
    url = "https://leetcode.com/contest/api/list/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://leetcode.com/contest/"
    }
    print(f"Testing {url}...")
    try:
        res = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            # print("Response:", json.dumps(data, indent=2))
            if 'contests' in data:
                print(f"Found {len(data['contests'])} contests in list.")
                # Filter for upcoming? 
                # Contests often have 'start_time' and 'is_virtual'
                pass
            else:
                print("No 'contests' key in response.")
        else:
            print(f"Body: {res.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_lc_rest()
