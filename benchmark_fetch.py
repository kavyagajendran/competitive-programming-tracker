import sys
import os
import time
import argparse
from unittest.mock import MagicMock, patch

# Add worker to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'worker'))

# Import tracker after mocking if needed, but we want to test the real logic structure
# taking care not to actually hit the network too hard if possible, but for a true benchmark we might want to.
# However, to avoid rate limits during dev, I'll mock the actual API call with a fixed delay.

import tracker

def mock_get_user_stats(username):
    # Simulate network delay of 0.5s
    time.sleep(0.5)
    return {
        "username": username,
        "ranking": 1000,
        "total_solved": 500,
        "attended_contests": 10,
        "rating": 1500
    }

def run_benchmark(count=10, workers=1):
    print(f"Benchmarking with {count} users and {workers} workers...")
    
    # Generate dummy users
    users = [f"user_{i}" for i in range(count)]
    csv_content = "Link\n" + "\n".join([f"https://leetcode.com/u/{u}" for u in users])
    
    # Mock the API calls to avoid hitting LeetCode
    with patch('tracker.get_user_stats', side_effect=mock_get_user_stats):
        with patch('tracker.update_sheet') as mock_update:
            start_time = time.time()
            
            # Call process_tracking
            # We need to modify process_tracking to accept workers arg, but it doesn't yet.
            # So this benchmark will fail or run sequentially until we modify tracker.py
            # For now, we test the current state (sequential).
            
            # Note: tracker.py doesn't currently accept workers arg, so we can't fully benchmark parallel yet 
            # without modifying it first. 
            # But we can simulate what we EXPECT by patching concurrent.futures in the future.
            
            # Actually, I'll write this benchmark to be ready for the new flag.
            # If the flag doesn't exist yet, it might crash if I pass it to main, 
            # but I'm calling process_tracking directly.
            
            # Wait, process_tracking signature needs update too? 
            # Or we just update the internal logic.
            
            # If I call tracker.main with args, I can pass the flag once implemented.
            
            # For now, let's just run it and see how long it takes.
            try:
                # We interpret workers=1 as current state
                tracker.process_tracking(csv_content, 'LeetCode', 'Test Sheet', is_content=True)
            except TypeError:
                # If we added an arg and it's not there yet
                tracker.process_tracking(csv_content, 'LeetCode', 'Test Sheet', is_content=True)

            end_time = time.time()
            duration = end_time - start_time
            print(f"Total time: {duration:.2f}s")
            print(f"Average time per user: {duration/count:.2f}s")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--count', type=int, default=10)
    parser.add_argument('--workers', type=int, default=1)
    args = parser.parse_args()
    
    run_benchmark(args.count, args.workers)
