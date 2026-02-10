
import requests
import datetime
import json

LEETCODE_URL = "https://leetcode.com/graphql"

def get_contest_data_by_date(username, date_str):
    query = """
    query userContestRankingHistory($username: String!) {
      userContestRankingHistory(username: $username) {
        contest {
          title
          startTime
        }
        ranking
        problemsSolved
        totalProblems
      }
    }
    """
    
    variables = {"username": username}
    payload = {"query": query, "variables": variables}
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": f"https://leetcode.com/{username}/",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(LEETCODE_URL, json=payload, headers=headers, timeout=10)
        data = response.json()
        
        history = data.get("data", {}).get("userContestRankingHistory", [])
        target_date = date_str
        
        print(f"Searching for {target_date} for user {username}...")
        
        for entry in history:
            contest = entry.get("contest", {})
            start_timestamp = contest.get("startTime")
            if start_timestamp:
                contest_date = datetime.datetime.utcfromtimestamp(start_timestamp).strftime('%Y-%m-%d')
                # Debug print
                # print(f"Checking: {contest.get('title')} - {contest_date}")
                if contest_date == target_date:
                    print(f"MATCH FOUND: {contest.get('title')}")
                    return entry
        
        print("NO MATCH FOUND")
        return None 

    except Exception as e:
        print(f"Exception: {e}")
        return None

# Test with a date around now.
# Current date is 2026-01-29. 
# Weekly 486 was 2026-01-25.
# Weekly 485 was 2026-01-18.

print("--- Test 1: hitesh_choudhary for 2026-01-25 ---")
get_contest_data_by_date("hitesh_choudhary", "2026-01-25")

print("\n--- Test 2: hitesh_choudhary for 2026-01-18 ---")
get_contest_data_by_date("hitesh_choudhary", "2026-01-18")
