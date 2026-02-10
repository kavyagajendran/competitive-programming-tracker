
import json
import concurrent.futures
from codeforces_api import get_upcoming_contests as get_cf
from leetcode_api import get_upcoming_contests as get_lc
from codechef_api import get_upcoming_contests as get_cc

def fetch_all():
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_cf = executor.submit(get_cf)
        future_lc = executor.submit(get_lc)
        future_cc = executor.submit(get_cc)
        
        try:
            results.extend(future_cf.result() or [])
        except Exception as e:
            print(f"CF Error: {e}")

        try:
            results.extend(future_lc.result() or [])
        except Exception as e:
            print(f"LC Error: {e}")

        try:
            results.extend(future_cc.result() or [])
        except Exception as e:
            print(f"CC Error: {e}")
            
    # Sort by start time
    results.sort(key=lambda x: x.get('startTime', ''))
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    fetch_all()
