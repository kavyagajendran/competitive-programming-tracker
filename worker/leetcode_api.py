import requests
import time

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
        print(f"Exception fetching {username}: {e}")
        return None

if __name__ == "__main__":
    # Test
    print(get_user_stats("hitesh_choudhary")) # Example user
