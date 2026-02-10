import requests
import time
import sys

base_user = "kit23bam"
start_idx = 2
count = 5

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

print(f"Testing batch fetch for {count} users...")

for i in range(count):
    idx = start_idx + i
    # formats to 002, 003, etc.
    username = f"{base_user}{idx:03d}"
    url = f"https://www.codechef.com/users/{username}"
    
    try:
        start_time = time.time()
        res = requests.get(url, headers=headers, timeout=10)
        elapsed = time.time() - start_time
        
        print(f"[{i+1}/{count}] {username}: Status {res.status_code} ({elapsed:.2f}s)")
        
        if res.status_code == 200:
            # Quick check for content
            if "rating-number" in res.text:
                print("  -> rating-number FOUND")
            else:
                print("  -> rating-number NOT FOUND (Possible parsing issue or empty profile)")
        elif res.status_code == 429:
            print("  -> RATE LIMITED")
        elif res.status_code == 403:
             print("  -> FORBIDDEN (Cloudflare/Bot protection)")
             
    except Exception as e:
        print(f"[{i+1}/{count}] {username}: Exception {e}")
        
    time.sleep(2) # 2s delay as in tracker.py
