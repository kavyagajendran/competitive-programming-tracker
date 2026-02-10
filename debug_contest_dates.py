
import requests
import datetime
import json

LEETCODE_URL = "https://leetcode.com/graphql"

def list_contest_dates(username):
    query = """
    query userContestRankingHistory($username: String!) {
      userContestRankingHistory(username: $username) {
        contest {
          title
          startTime
        }
        ranking
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
        
        print(f"Contest History for {username}:")
        for entry in history:
            contest = entry.get("contest", {})
            start_timestamp = contest.get("startTime")
            title = contest.get("title")
            
            # UTC Date
            utc_date = datetime.datetime.utcfromtimestamp(start_timestamp).strftime('%Y-%m-%d')
            # Local Date (Server time)
            local_date = datetime.datetime.fromtimestamp(start_timestamp).strftime('%Y-%m-%d')
            
            print(f"Title: {title}, Timestamp: {start_timestamp}, UTC: {utc_date}, Local: {local_date}")

    except Exception as e:
        print(e)

if __name__ == "__main__":
    list_contest_dates("hitesh_choudhary")
