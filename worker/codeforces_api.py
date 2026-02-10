import requests
import time
from datetime import datetime

# Global session with retries
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(max_retries=3)
session.mount('https://', adapter)
session.mount('http://', adapter)

def get_codeforces_stats(username):
    """
    Fetches user statistics from Codeforces API.
    """
    # 1. User Info
    info_url = f"https://codeforces.com/api/user.info?handles={username}"
    # 2. User Status (for solved count)
    status_url = f"https://codeforces.com/api/user.status?handle={username}"
    
    stats = {
        "username": username,
        "platform": "Codeforces"
    }
    
    try:
        # Fetch Info
        res_info = session.get(info_url, timeout=30)
        if res_info.status_code != 200:
            print(f"Codeforces API Info failed: {res_info.status_code}")
            return {"error": f"HTTP {res_info.status_code}"}
            
        data_info = res_info.json()
        if data_info['status'] != 'OK':
            return {"error": data_info.get('comment', 'API Error')}
            
        user = data_info['result'][0]
        stats['current_rank'] = user.get('rank', 'N/A')
        stats['current_rating'] = user.get('rating', 0)
        stats['max_rank'] = user.get('maxRank', 'N/A')
        stats['max_rating'] = user.get('maxRating', 0)
        
        # Fetch Status for Solved Count
        # This can be large, but usually okay.
        res_status = session.get(status_url, timeout=30)
        if res_status.status_code == 200:
            data_status = res_status.json()
            if data_status['status'] == 'OK':
                submissions = data_status['result']
                solved_problems = set()
                last_contest_solved = set()
                
                # Fetch Info to get last contest ID
                # We need a separate call for rating history to be accurate about "Last Contest"
                try:
                    res_rating = requests.get(f"https://codeforces.com/api/user.rating?handle={username}", timeout=10)
                    if res_rating.status_code == 200 and res_rating.json()['status'] == 'OK':
                        history = res_rating.json()['result']
                        if history:
                            last_contest = history[-1]
                            last_contest_id = last_contest['contestId']
                            stats['last_contest_title'] = last_contest['contestName']
                            stats['last_contest_rank'] = last_contest['rank']
                            
                            # Count solved in this contest
                            for sub in submissions:
                                if sub.get('contestId') == last_contest_id:
                                    if sub.get('verdict') == 'OK':
                                        last_contest_solved.add(sub['problem']['index'])
                            stats['last_contest_solved'] = len(last_contest_solved)
                except Exception as e:
                    print(f"Error fetching CF rating history: {e}")

                for sub in submissions:
                    if sub.get('verdict') == 'OK':
                        prob = sub.get('problem', {})
                        if 'contestId' in prob and 'index' in prob:
                            pid = f"{prob['contestId']}{prob['index']}"
                            solved_problems.add(pid)
                
                stats['total_solved'] = len(solved_problems)
            else:
                stats['total_solved'] = 0
        else:
             stats['total_solved'] = 0

        return stats

    except Exception as e:
        print(f"Exception fetching Codeforces {username}: {e}")
        return {"error": f"Exception: {str(e)}"}


def get_upcoming_contests():
    """
    Fetches upcoming contests from Codeforces.
    """
    url = "https://codeforces.com/api/contest.list?gym=false"
    try:
        res = session.get(url, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if data['status'] == 'OK':
                contests = data['result']
                upcoming = []
                for c in contests:
                    if c['phase'] == 'BEFORE':
                        # Convert unix timestamp to ISO
                        start_time = datetime.fromtimestamp(c['startTimeSeconds'])
                        upcoming.append({
                            'id': c['id'],
                            'name': c['name'],
                            'startTime': start_time.isoformat(),
                            'duration': c['durationSeconds'],
                            'platform': 'Codeforces',
                            'url': f"https://codeforces.com/contests/{c['id']}"
                        })
                return upcoming
    except Exception as e:
        print(f"Error fetching Codeforces contests: {e}")
        return []

if __name__ == "__main__":
    # print(get_codeforces_stats("tourist"))
    print(get_upcoming_contests())
