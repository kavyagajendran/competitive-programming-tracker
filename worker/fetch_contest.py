import argparse
import json
import sys
from leetcode_api import get_contest_data_by_date

def main():
    parser = argparse.ArgumentParser(description="Fetch LeetCode contest details by date.")
    parser.add_argument("--username", required=True, help="LeetCode username")
    parser.add_argument("--date", required=True, help="Date in YYYY-MM-DD format")
    
    args = parser.parse_args()
    
    try:
        result = get_contest_data_by_date(args.username, args.date)
        if result:
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "No contest found for this date"}))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
