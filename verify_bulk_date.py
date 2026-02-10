
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'worker'))
from worker.tracker import process_tracking
import pandas as pd
import io

# Mock CSV content
csv_content = """Profile Link
https://leetcode.com/hitesh_choudhary
"""

# Mock update_sheet to print results instead of calling API
import worker.tracker
def mock_update_sheet(target, data):
    print(f"--- MOCK UPDATE SHEET ({target}) ---")
    import json
    print(json.dumps(data, indent=2))
    
    # Assertion check for merged data
    if data:
        first = data[0]
        has_global = 'Global Ranking' in first
        has_contest = 'Contest Title' in first
        print(f"VERIFICATION: Has Global Stats? {has_global}")
        print(f"VERIFICATION: Has Contest Stats? {has_contest}")
    
    return True

worker.tracker.update_sheet = mock_update_sheet

print("Testing Bulk Date Tracking...")
# Test with failure date
process_tracking(csv_content, "LeetCode", "Test Sheet", is_content=True, contest_date="2026-01-25")
