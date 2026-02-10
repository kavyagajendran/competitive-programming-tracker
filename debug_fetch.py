import requests
import sys

# Get username from args or default
username = sys.argv[1] if len(sys.argv) > 1 else 'kit23bam002'
url = f'https://www.codechef.com/users/{username}'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

try:
    print(f"Fetching {url}... (Timeout 15s)")
    res = requests.get(url, headers=headers, timeout=15)
    print(f"Status: {res.status_code}")
    print(f"Content-Length: {len(res.content)}")
    print(f"Is Cloudflare: {'Just a moment' in res.text}")
    
    filename = f'debug_{username}.html'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(res.text)
    print(f"Saved response to {filename}")
    
    # Quick Check strings
    if 'rating-number' in res.text:
        print("Found 'rating-number'")
    else:
        print("NOT Found 'rating-number'")
        
    if 'problems-solved' in res.text:
         print("Found 'problems-solved'")
    else:
         print("NOT Found 'problems-solved'")
         
except Exception as e:
    print(f"Exception: {e}")
