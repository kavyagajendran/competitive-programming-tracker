import requests

url = 'https://www.codechef.com/users/kit23bam025'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

try:
    print(f"Fetching {url}...")
    res = requests.get(url, headers=headers, timeout=15)
    print(f"Status: {res.status_code}")
    print(f"Content-Length: {len(res.content)}")
    print(f"Is Cloudflare: {'Just a moment' in res.text}")
    
    with open('debug_fail.html', 'w', encoding='utf-8') as f:
        f.write(res.text)
    print("Saved response to debug_fail.html")
except Exception as e:
    print(f"Exception: {e}")
