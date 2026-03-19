import requests

def test_cf_full():
    url = "https://codeforces.com/api/contest.list?gym=false"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://codeforces.com/",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1"
    }
    
    print(f"Testing {url} with full headers...")
    try:
        res = requests.get(url, headers=headers, timeout=15)
        print(f"Status: {res.status_code}")
        print(f"Content-Type: {res.headers.get('Content-Type')}")
        if res.status_code == 200:
            print("Success!")
            print(res.text[:200])
        else:
            print("Failed.")
            print(res.text[:500])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cf_full()
