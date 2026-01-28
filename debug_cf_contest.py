import requests

def get_last_contest_stats(username):
    print(f"Checking {username}...")
    
    # 1. Get Contest History to find last contest
    rating_url = f"https://codeforces.com/api/user.rating?handle={username}"
    try:
        res = requests.get(rating_url, timeout=10)
        data = res.json()
        if data['status'] != 'OK':
            print("Failed to get rating history")
            return

        history = data['result']
        if not history:
            print("No contest history")
            return

        last_contest = history[-1]
        contest_id = last_contest['contestId']
        contest_name = last_contest['contestName']
        rank = last_contest['rank']
        
        print(f"Last Contest: {contest_name} (ID: {contest_id})")
        print(f"Rank: {rank}")

        # 2. Get Submissions to count solved in that contest
        status_url = f"https://codeforces.com/api/user.status?handle={username}&from=1&count=100" 
        # Note: 'from=1&count=100' might miss it if they have done many problems since.
        # Better to fetch more or loop, but for debug let's try default (usually returns last 10 subs? No, returns many).
        # Actually user.status returns list of submissions. limit is needed?
        # If we remove count/from, it returns ALL. For huge users this is bad. 
        # But we only need the recent ones.
        
        status_url = f"https://codeforces.com/api/user.status?handle={username}&from=1&count=500"
        res_status = requests.get(status_url, timeout=15)
        status_data = res_status.json()
        
        solved_count = 0
        tried_count = 0
        unique_solved = set()
        
        if status_data['status'] == 'OK':
            for sub in status_data['result']:
                if sub.get('contestId') == contest_id:
                    # It's this contest
                    if sub['verdict'] == 'OK':
                        unique_solved.add(sub['problem']['index'])
        
        print(f"Problems Solved in Last Contest: {len(unique_solved)}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_last_contest_stats("tourist")
    get_last_contest_stats("MikeMirzayanov")
