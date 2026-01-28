from worker.leetcode_api import get_user_stats
import json

username = "hitesh_choudhary"
print(f"Fetching stats for {username}...")
stats = get_user_stats(username)

if stats:
    print("\n--- Parsed Stats ---")
    print(json.dumps(stats, indent=2))
    
    # Assertions
    keys = ['top_percentage', 'last_contest_rank', 'last_contest_solved']
    missing = [k for k in keys if k not in stats]
    
    if not missing:
        print("\nSUCCESS: All new keys present.")
    else:
        print(f"\nFAILURE: Missing keys: {missing}")
else:
    print("Failed to fetch stats.")
