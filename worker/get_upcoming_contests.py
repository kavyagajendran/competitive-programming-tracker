import json
import concurrent.futures
import sys
import argparse
from codeforces_api import get_upcoming_contests as get_cf
from leetcode_api import get_upcoming_contests as get_lc
from codechef_api import get_upcoming_contests as get_cc

def fetch_all(output_file=None):
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_cf = executor.submit(get_cf)
        future_lc = executor.submit(get_lc)
        future_cc = executor.submit(get_cc)
        
        try:
            results.extend(future_cf.result() or [])
        except Exception as e:
            sys.stderr.write(f"CF Error: {e}\n")

        try:
            results.extend(future_lc.result() or [])
        except Exception as e:
            sys.stderr.write(f"LC Error: {e}\n")

        try:
            results.extend(future_cc.result() or [])
        except Exception as e:
            sys.stderr.write(f"CC Error: {e}\n")
            
    # Sort by start time
    results.sort(key=lambda x: x.get('startTime', ''))
    
    json_data = json.dumps(results, indent=2)
    if output_file:
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(json_data)
            # Print a small confirmation to stdout that is NOT JSON
            print(f"SUCCESS: Written to {output_file}")
        except Exception as e:
            sys.stderr.write(f"File Write Error: {e}\n")
            print(json_data)
    else:
        print(json_data)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', help='Output JSON file')
    args = parser.parse_args()
    fetch_all(args.output)
