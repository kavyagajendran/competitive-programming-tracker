from codeforces_api import get_upcoming_contests as get_cf
from leetcode_api import get_upcoming_contests as get_lc
from codechef_api import get_upcoming_contests as get_cc
import json

with open('diag_results.txt', 'w', encoding='utf-8') as f:
    f.write("--- CODEFORCES ---\n")
    try:
        cf = get_cf()
        for c in cf:
            f.write(f"CF: {repr(c['name'])}\n")
    except Exception as e:
        f.write(f"CF Error: {e}\n")

    f.write("--- LEETCODE ---\n")
    try:
        lc = get_lc()
        for c in lc:
            f.write(f"LC: {repr(c['name'])}\n")
    except Exception as e:
        f.write(f"LC Error: {e}\n")

    f.write("--- CODECHEF ---\n")
    try:
        cc = get_cc()
        for c in cc:
            f.write(f"CC: {repr(c['name'])}\n")
    except Exception as e:
        f.write(f"CC Error: {e}\n")
