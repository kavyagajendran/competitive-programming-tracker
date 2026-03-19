import requests
import json
import urllib.parse
from datetime import datetime

def test_lc_proxy():
    target_url = "https://leetcode.com/graphql"
    proxy_url = f"https://api.allorigins.win/raw?url={urllib.parse.quote(target_url)}"

    query = """
    query {
        topTwoContests {
            title
            titleSlug
            startTime
            duration
            originStartTime
            isVirtual
        }
    }
    """
    
    payload = {"query": query}
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json"
    }

    print(f"Fetching via proxy: {proxy_url}")
    try:
        response = requests.post(proxy_url, json=payload, headers=headers, timeout=15)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            try:
                data = response.json()
                print("Raw JSON Data:", json.dumps(data, indent=2))
                contests = data.get('data', {}).get('topTwoContests', [])
                print(f"Found {len(contests)} contests.")
                for c in contests:
                    print(f" - {c['title']} ({c['titleSlug']})")
            except Exception as e:
                print(f"Parse Error: {e}")
                print(f"Response Text: {response.text[:500]}")
        else:
            print(f"Body: {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_lc_proxy()
