import argparse
import json
import sys
from leetcode_api import get_contest_data_by_date

def main():
    parser = argparse.ArgumentParser(description="Fetch LeetCode contest details by date.")
    parser.add_argument("--username", required=True, help="LeetCode username")
    parser.add_argument("--date", required=True, help="Date in YYYY-MM-DD format")
    parser.add_argument("--output", help="Output JSON file")
    
    args = parser.parse_args()
    
    try:
        result = get_contest_data_by_date(args.username, args.date)
        if result:
            json_data = json.dumps(result)
        else:
            json_data = json.dumps({"error": "No contest found for this date"})

        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(json_data)
            print(f"SUCCESS: Written to {args.output}")
        else:
            print(json_data)

    except Exception as e:
        err_msg = json.dumps({"error": str(e)})
        sys.stderr.write(err_msg + "\n")
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(err_msg)
        else:
            print(err_msg)
        sys.exit(1)

if __name__ == "__main__":
    main()
