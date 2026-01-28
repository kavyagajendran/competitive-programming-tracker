from worker.codeforces_api import get_codeforces_stats
import json

username = "tourist"
print(f"Fetching stats for {username}...")
stats = get_codeforces_stats(username)

if stats and 'error' not in stats:
    print("\n--- Parsed Stats ---")
    print(json.dumps(stats, indent=2))
    
    # Assertions
    keys = ['current_rank', 'current_rating', 'max_rank', 'max_rating', 'total_solved', 
            'last_contest_rank', 'last_contest_solved', 'last_contest_title']
    missing = [k for k in keys if k not in stats]
    
    if not missing:
        print("\nSUCCESS: All Codeforces keys present.")
        if stats['total_solved'] > 0:
            print(f"Verified Solved Count: {stats['total_solved']}")
        else:
            print("WARNING: Total Solved is 0 (might be API issue or new user)")
    else:
        print(f"\nFAILURE: Missing keys: {missing}")
else:
    print(f"Failed to fetch stats: {stats}")
