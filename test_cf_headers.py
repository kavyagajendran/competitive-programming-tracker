import requests

def test_cf():
    urls = [
        "https://codeforces.com/api/contest.list?gym=false",
        "https://codeforces.com/api/user.info?handles=tourist",
        "https://codeforces.com"
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    for url in urls:
        print(f"\nTesting {url}...")
        try:
            res = requests.get(url, headers=headers, timeout=10)
            print(f"Status: {res.status_code}")
            print(f"Content: {res.text[:500]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_cf()
