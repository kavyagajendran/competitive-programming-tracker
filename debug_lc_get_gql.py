import requests
import json
import urllib.parse

def test_lc_get_graphql():
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
    params = {"query": query}
    url = "https://leetcode.com/graphql"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://leetcode.com/contest/"
    }
    print(f"Testing {url} with GET and query params...")
    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print("Success!")
            print(json.dumps(data, indent=2))
        else:
            print(f"Body: {res.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_lc_get_graphql()
