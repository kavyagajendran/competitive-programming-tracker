from codeforces_api import get_upcoming_contests as get_cf
from leetcode_api import get_upcoming_contests as get_lc
from codechef_api import get_upcoming_contests as get_cc
import json

print("--- CODEFORCES ---")
try:
    cf = get_cf()
    for c in cf:
        print(f"CF: {repr(c['name'])}")
except Exception as e:
    print(f"CF Error: {e}")

print("--- LEETCODE ---")
try:
    lc = get_lc()
    for c in lc:
        print(f"LC: {repr(c['name'])}")
except Exception as e:
    print(f"LC Error: {e}")

print("--- CODECHEF ---")
try:
    cc = get_cc()
    for c in cc:
        print(f"CC: {repr(c['name'])}")
except Exception as e:
    print(f"CC Error: {e}")
