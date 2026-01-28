import requests
from bs4 import BeautifulSoup
import time

def get_codechef_stats(username):
    """
    Scrapes user statistics from CodeChef profile page.
    """
    url = f"https://www.codechef.com/users/{username}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    retries = 3
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                break
            elif response.status_code == 429:
                # Rate limited
                wait = (2 ** attempt) * 2
                print(f"Rate limited for {username}. Retrying in {wait}s...")
                time.sleep(wait)
                continue
            elif response.status_code == 404:
                print(f"User {username} not found (404).")
                return {"error": "User Not Found (404)"}
            else:
                print(f"Failed to fetch CodeChef profile for {username}. Status: {response.status_code}")
                # Don't retry for other 4xx errors usually, but 5xx we might.
                if response.status_code >= 500:
                    time.sleep(1)
                    continue
                return {"error": f"HTTP {response.status_code}"}
        except requests.RequestException as e:
            print(f"Network error for {username}: {e}")
            time.sleep(1)
            continue
    else:
        # Loop finished without breaking
        print(f"Max retries reached for {username}")
        return {"error": "Max retries (Rate Limit/Network)"}

    try:
        soup = BeautifulSoup(response.content, 'html.parser')

        stats = {
            "username": username,
            "platform": "CodeChef"
        }

        # Rating Header
        rating_header = soup.find('div', class_='rating-header')
        if rating_header:
            rating_div = rating_header.find('div', class_='rating-number')
            stats['current_rating'] = int(rating_div.text.strip()) if rating_div else 0
            
            # Division (often in a small tag or implied by rating)
            # CodeChef doesn't always explicitly show Div on profile, but valid for contests.
            # We can try to find the star rating.
            star_span = soup.find('span', class_='rating')
            stats['star_rating'] = star_span.text.strip() if star_span else "N/A"

            # Division Inference
            # Div 1: >= 2000
            # Div 2: 1600 <= Rating < 2000
            # Div 3: 1200 <= Rating < 1600
            # Div 4: < 1200
            rating = stats.get('current_rating', 0)
            if rating >= 2000:
                stats['division'] = 'Div 1'
            elif rating >= 1600:
                stats['division'] = 'Div 2'
            elif rating >= 1200:
                stats['division'] = 'Div 3'
            else:
                stats['division'] = 'Div 4'

            highest_rating_div = rating_header.find('small')
            if highest_rating_div:
                # Format: (Highest Rating 1234)
                txt = highest_rating_div.text.strip()
                import re
                nums = re.findall(r'\d+', txt)
                stats['highest_rating'] = int(nums[0]) if nums else 0

        # Ranks
        rating_ranks = soup.find('div', class_='rating-ranks')
        if rating_ranks:
            strongs = rating_ranks.find_all('strong')
            if len(strongs) >= 2:
                stats['global_ranking'] = strongs[0].text.strip()
                stats['country_ranking'] = strongs[1].text.strip()

        # Problem Solved
        # New CodeChef UI uses different structure.
        # Look for the section with class 'problems-solved'
        problems_solved_section = soup.find('section', class_='problems-solved')
        if problems_solved_section:
            h3s = problems_solved_section.find_all('h3')
            for h3 in h3s:
                if 'Total Problems Solved' in h3.text:
                    txt = h3.text.strip()
                    import re
                    nums = re.findall(r'\d+', txt)
                    if nums:
                        stats['total_solved'] = int(nums[0])
                        break
        
        # Contests Participated - usually not explicitly stated as a count on main profile without clicking 'Contests' tab.
        # We might skip or infer.
        stats['contests_participated'] = 0 # Placeholder

        return stats

    except Exception as e:
        print(f"Exception fetching CodeChef {username}: {e}")
        return {"error": f"Exception: {str(e)}"}

if __name__ == "__main__":
    # Test
    print(get_codechef_stats("gennady"))
