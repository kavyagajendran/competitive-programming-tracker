import requests
import socket

def check_dns(hostname):
    try:
        print(f"Resolving {hostname}...")
        addr = socket.gethostbyname(hostname)
        print(f"Resolved {hostname} to {addr}")
        return True
    except Exception as e:
        print(f"Failed to resolve {hostname}: {e}")
        return False

def check_http(url):
    try:
        print(f"Fetching {url}...")
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return False

if __name__ == "__main__":
    print("--- Connectivity Test ---")
    if check_dns("google.com"):
        check_http("https://www.google.com")
    
    print("\n--- Codeforces Test ---")
    if check_dns("codeforces.com"):
        check_http("https://codeforces.com/api/contest.list?gym=false")
