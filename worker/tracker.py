import sys
import re
import pandas as pd
from datetime import datetime
from leetcode_api import get_user_stats
from codechef_api import get_codechef_stats
from codeforces_api import get_codeforces_stats
from sheets_api import update_sheet
import time
import argparse
import io

def process_tracking(csv_path_or_content, platform, sheet_target, is_content=False, allowed_fields=None):
    # print(f"[{datetime.now()}] Starting tracking for Platform: {platform}, Target: {sheet_target}")
    pass # Silent start or very minimal
    
    # 1. Read CSV
    try:
        if is_content:
            # Assume content is passed directly (newline separated or proper csv)
            # If it's just a list of links, we assume no header or specific header
            # For robustness, let's assume it might be a raw string of URLs 
            # or a properly formatted CSV string.
            try:
                # Try reading as CSV with header
                df = pd.read_csv(io.StringIO(csv_path_or_content))
                # Check if 'Profile Link' or similar exists, else assume first col is links
                col_name = df.columns[0]
            except:
                # Fallback: treat as list of strings
                lines = csv_path_or_content.strip().split('\n')
                df = pd.DataFrame(lines, columns=['Link'])
                col_name = 'Link'
        else:
            df = pd.read_csv(csv_path_or_content)
            col_name = df.columns[0] # Assume first column has links if not specified
            
    except Exception as e:
        print(f"Error reading CSV input: {e}")
        return

    updated_data = []
    
    # Parse allowed fields if provided
    fields_list = None
    if allowed_fields:
        fields_list = [f.strip() for f in allowed_fields.split(',') if f.strip()]
        mandatory = ['Profile Link', 'Username', 'Last Updated']
        for m in mandatory:
            if m not in fields_list:
                fields_list.append(m)

    total = len(df)
    print(f"Tracking {total} {platform} profiles...")

    # 2. Iterate
    for index, row in df.iterrows():
        profile_url = str(row[col_name]).strip()
        
        if not profile_url or pd.isna(profile_url):
            continue
            
        username = extract_username(profile_url, platform)
        # Short log: [1/5] username
        print(f"[{index+1}/{total}] {username}")
        
        stats = None
        if platform.lower() == 'leetcode':
            stats = get_user_stats(username)
        elif platform.lower() == 'codechef':
            stats = get_codechef_stats(username)
        elif platform.lower() == 'codeforces':
            stats = get_codeforces_stats(username)
            
        # Check failure
        if not stats or (isinstance(stats, dict) and 'error' in stats):
            error_msg = stats.get('error', 'No Stats') if stats else 'No Stats'
            print(f"  -> Failed: {error_msg}")
            
            updated_data.append({
                'Profile Link': profile_url, 
                'Username': stats.get('username', username) if stats else username, 
                'Error': error_msg,
                'Last Updated': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
        else:
            # Success logic
            # Common fields
            record = {
                'Profile Link': profile_url,
                'Username': stats.get('username', username),
                'Last Updated': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Platform specific
            if platform.lower() == 'leetcode':
                record.update({
                    'Global Ranking': stats.get('ranking', 'N/A'),
                    'Contest Ranking': stats.get('contest_global_ranking', 'N/A'),
                    'Total Solved': stats.get('total_solved', 0),
                    'Easy': stats.get('solved_easy', 0),
                    'Medium': stats.get('solved_medium', 0),
                    'Hard': stats.get('solved_hard', 0),
                    'Contest Rating': stats.get('rating', 0),
                    'Attended Contests': stats.get('attended_contests', 0),
                    'Top Percentage': f"{stats.get('top_percentage', 0)}%",
                    'Last Contest Rank': stats.get('last_contest_rank', 'N/A'),
                    'Last Contest Solved': stats.get('last_contest_solved', 'N/A')
                })
            elif platform.lower() == 'codechef':
                record.update({
                    'Current Rating': stats.get('current_rating', 0),
                    'Highest Rating': stats.get('highest_rating', 0),
                    'Star Rating': stats.get('star_rating', 'N/A'),
                    'Global Ranking': stats.get('global_ranking', 'N/A'),
                    'Country Ranking': stats.get('country_ranking', 'N/A'),
                    'Division': stats.get('division', 'N/A'),
                    'Total Solved': stats.get('total_solved', 0)
                })
            elif platform.lower() == 'codeforces':
                record.update({
                    'Current Rank': stats.get('current_rank', 'N/A'),
                    'Current Rating': stats.get('current_rating', 0),
                    'Max. Rank': stats.get('max_rank', 'N/A'),
                    'Max. Rating': stats.get('max_rating', 0),
                    'Problems Solved': stats.get('total_solved', 0),
                    'Last Contest Rank': stats.get('last_contest_rank', 'N/A'),
                    'Last Contest Solved': stats.get('last_contest_solved', 'N/A'),
                    'Last Contest': stats.get('last_contest_title', 'N/A')
                })
                
            # Filter fields if fields_list is set
            if fields_list:
                filtered_record = {k: v for k, v in record.items() if k in fields_list}
                updated_data.append(filtered_record)
            else:
                updated_data.append(record)

        # Rate limit
        time.sleep(2)

    # 3. Update Sheet
    if updated_data:
        res = update_sheet(sheet_target, updated_data)
        print(f"Done. Updated {len(updated_data)} rows.")
    else:
        print("No data collected.")

def extract_username(url, platform):
    url = url.strip()
    
    # Regex Patterns
    # LeetCode: leetcode.com/u/username or leetcode.com/username
    if platform.lower() == 'leetcode':
        # Group 1 captures the username
        # Matches: /u/username, /username
        # Be careful not to match /problems/, /contest/ if possible, but the user is providing profile links.
        # Strict pattern: 
        # https://leetcode.com/u/username
        # https://leetcode.com/username
        
        match = re.search(r'leetcode\.com/(?:u/)?([^/?#]+)', url, re.IGNORECASE)
        if match:
            return match.group(1)
            
    elif platform.lower() == 'codechef':
        # https://www.codechef.com/users/gennady
        match = re.search(r'codechef\.com/users/([^/?#]+)', url, re.IGNORECASE)
        if match:
            return match.group(1)
            
    elif platform.lower() == 'codeforces':
        # https://codeforces.com/profile/tourist
        match = re.search(r'codeforces\.com/profile/([^/?#]+)', url, re.IGNORECASE)
        if match:
            return match.group(1)
    
    # Fallback to simple split if regex fails (though regex matches loosely)
    parts = url.rstrip('/').split('/')
    return parts[-1]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', help='Path to CSV file or raw content string')
    parser.add_argument('--platform', help='Platform (LeetCode/CodeChef)', default='LeetCode')
    parser.add_argument('--sheet', help='Target Google Sheet Name or ID', default='Tracking Data')
    parser.add_argument('--is_content', action='store_true', help='Flag to treat csv arg as content string')
    parser.add_argument('--fields', help='Comma separated list of fields to update', default=None)
    
    args = parser.parse_args()
    
    if not args.csv:
        print("Error: CSV input required")
        sys.exit(1)
        
    process_tracking(args.csv, args.platform, args.sheet, args.is_content, args.fields)
