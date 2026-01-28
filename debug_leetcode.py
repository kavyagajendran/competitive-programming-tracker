import requests
import json

LEETCODE_URL = "https://leetcode.com/graphql"

def test_leetcode_contest_stats(username):
    query = """
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        contest {
          title
        }
        rating
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
        print(f"Fetching data for {username}...")
        response = requests.post(LEETCODE_URL, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        if "errors" in data:
            print("Errors:", data['errors'])
        else:
            print("userContestRanking:", json.dumps(data['data']['userContestRanking'], indent=2))
            history = data['data']['userContestRankingHistory']
            if history:
                print("Latest History Entry:", json.dumps(history[-1], indent=2))
                # Check for filtered (attended) contests? usually history includes all IF they registered? 
                # Actually history usually contains only attended ones or where rating changed?
                
                # Find last attended contest (where problemsSolved > 0 or attended is true?)
                # LeetCode history usually only returns contests the user participated in.
                pass
            else:
                print("No history found")

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    # Use a known active user, e.g., 'neal_wu' or similar, or the user from previous context if known (don't know leetcode user).
    # Using 'hitesh_choudhary' or someone generic to test structure.
    test_leetcode_contest_stats("hitesh_choudhary")
