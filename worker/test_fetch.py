import sys
import os

# Ensure we can import from the worker directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tracker import extract_username
from leetcode_api import get_user_stats

def test_extraction():
    print("Testing URL Extraction...")
    test_cases = [
        ("https://leetcode.com/u/test_user", "test_user"),
        ("https://leetcode.com/u/test_user/", "test_user"),
        ("leetcode.com/u/test_user_2", "test_user_2"),
        ("https://leetcode.com/old_user", "old_user"),
        ("https://leetcode.com/u/user.name.123/", "user.name.123"),
        ("https://leetcode.com/u/user?args=1", "user"),
        ("https://www.codechef.com/users/gennady", "gennady"),
        ("codechef.com/users/gennady", "gennady"),
    ]
    
    passed = 0
    for url, expected in test_cases:
        extracted = extract_username(url, "LeetCode")
        if extracted == expected:
            print(f"[PASS] {url} -> {extracted}")
            passed += 1
        else:
            print(f"[FAIL] {url} -> {extracted} (Expected: {expected})")
            
    print(f"Extraction Tests: {passed}/{len(test_cases)} passed.\n")
    if passed != len(test_cases):
        sys.exit(1)

def test_api():
    print("Testing API Fetching...")
    # Use a knwon user, e.g. "hitesh_choudhary" or someone popular/stable
    username = "hitesh_choudhary" 
    print(f"Fetching stats for: {username}")
    
    stats = get_user_stats(username)
    
    if stats:
        print("[PASS] API Fetch Successful")
        print(f"Stats: {stats}")
    else:
        print("[FAIL] API Fetch Failed")
        sys.exit(1)

if __name__ == "__main__":
    test_extraction()
    test_api()
