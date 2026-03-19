import datetime
import requests
import time
import sys

LEETCODE_URL = "https://leetcode.com/graphql"

def get_user_stats(username):
    """
    Fetches user statistics from LeetCode GraphQL API.
    """
    query = """
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
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
        response = requests.post(LEETCODE_URL, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if "errors" in data:
            print(f"Error fetching data for {username}: {data['errors']}")
            return None

        matched_user = data.get("data", {}).get("matchedUser")
        user_contest = data.get("data", {}).get("userContestRanking")

        if not matched_user:
            return None

        # Parse stats
        stats = {}
        stats["username"] = matched_user["username"]
        stats["ranking"] = matched_user["profile"]["ranking"]
        
        # Solved counts
        ac_submissions = matched_user["submitStats"]["acSubmissionNum"]
        total_solved = 0
        for item in ac_submissions:
            if item["difficulty"] == "All":
                total_solved = item["count"]
            stats[f"solved_{item['difficulty'].lower()}"] = item["count"]
        stats["total_solved"] = total_solved

        # Contest stats
        if user_contest:
            stats["attended_contests"] = user_contest["attendedContestsCount"]
            stats["rating"] = int(user_contest["rating"]) if user_contest["rating"] else 0
            stats["contest_global_ranking"] = user_contest["globalRanking"]
            stats["top_percentage"] = user_contest.get("topPercentage", 0)
        else:
            stats["attended_contests"] = 0
            stats["rating"] = 0
            stats["contest_global_ranking"] = "N/A"
            stats["top_percentage"] = 0

        # Last Contest Details from History
        contest_history = data.get("data", {}).get("userContestRankingHistory")
        if contest_history and len(contest_history) > 0:
            last = contest_history[-1]
            stats["last_contest_rank"] = last.get("ranking")
            stats["last_contest_solved"] = f"{last.get('problemsSolved')}/{last.get('totalProblems')}"
        else:
            stats["last_contest_rank"] = "N/A"
            stats["last_contest_solved"] = "N/A"

        return stats

    except Exception as e:
        sys.stderr.write(f"Exception fetching {username}: {e}\n")
        return None

def get_contest_data_by_date(username, date_str):
    """
    Fetches contest details for a specific date (YYYY-MM-DD).
    """
    query = """
    query userContestRankingHistory($username: String!) {
      userContestRankingHistory(username: $username) {
        contest {
          title
          startTime
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
        response = requests.post(LEETCODE_URL, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if "errors" in data:
            print(f"Error fetching data for {username}: {data['errors']}")
            return None

        history = data.get("data", {}).get("userContestRankingHistory", [])
        
        # Convert input date to timestamp range for the whole day (UTC)
        # Using simple string comparison on YYYY-MM-DD might be easier if we convert timestamp to date
        
        target_date = date_str
        
        for entry in history:
            contest = entry.get("contest", {})
            start_timestamp = contest.get("startTime")
            if start_timestamp:
                # Convert timestamp to YYYY-MM-DD
                contest_date = datetime.datetime.utcfromtimestamp(start_timestamp).strftime('%Y-%m-%d')
                if contest_date == target_date:
                    # Found the contest
                    return {
                        "title": contest.get("title"),
                        "startTime": start_timestamp,
                        "date": contest_date,
                        "rank": entry.get("ranking"),
                        "rating": entry.get("rating"),
                        "problemsSolved": entry.get("problemsSolved"),
                        "totalProblems": entry.get("totalProblems")
                    }
        
        return None # Not found

    except Exception as e:
        sys.stderr.write(f"Exception fetching contest by date for {username}: {e}\n")
        return None


def get_upcoming_contests():
    """
    Fetches upcoming contests from LeetCode GraphQL.
    """
    query = """
    query {
        topTwoContests {
            title
            titleSlug
            startTime
            duration
            originStartTime
            isVirtual
        }
    }
    """
    
    payload = {"query": query}
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post("https://leetcode.com/graphql", json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            contests = data.get('data', {}).get('topTwoContests', [])
            upcoming = []
            for c in contests:
                start_time = datetime.datetime.fromtimestamp(c['startTime'])
                upcoming.append({
                    'id': c['titleSlug'],
                    'name': c['title'],
                    'startTime': start_time.isoformat(),
                    'duration': c['duration'],
                    'platform': 'LeetCode',
                    'url': f"https://leetcode.com/contest/{c['titleSlug']}"
                })
            return upcoming
    except Exception as e:
        sys.stderr.write(f"Error fetching LeetCode contests: {e}\n")
        return []

if __name__ == "__main__":
    # Test
    # print(get_user_stats("hitesh_choudhary")) # Example user
    # print(get_contest_data_by_date("hitesh_choudhary", "2023-01-01"))
    print(get_upcoming_contests())

