import requests
import json
import urllib.parse
import datetime

def test_final_logic():
    query = """
    query {
        topTwoContests {
            title
            titleSlug
            startTime
            duration
        }
    }
    """
    params = urllib.parse.urlencode({"query": query})
    target_url = f"https://leetcode.com/graphql?{params}"
    proxy_url = f"https://api.allorigins.win/raw?url={urllib.parse.quote(target_url)}"

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://leetcode.com/contest/"
    }

    print(f"Target URL: {target_url}")
    print(f"Proxy URL: {proxy_url}")
    
    try:
        response = requests.get(proxy_url, headers=headers, timeout=15)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print(json.dumps(data, indent=2))
        else:
            print(f"Body: {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_final_logic()
