import requests
import time

def check_codeforces(username):
    print(f"Checking Codeforces for {username}...")
    
    # 1. API Check
    api_url = f"https://codeforces.com/api/user.info?handles={username}"
    try:
        res = requests.get(api_url, timeout=10)
        data = res.json()
        if data['status'] == 'OK':
            user = data['result'][0]
            print("API Success:")
            print(f"  Rank: {user.get('rank')}")
            print(f"  Rating: {user.get('rating')}")
            print(f"  Max Rank: {user.get('maxRank')}")
            print(f"  Max Rating: {user.get('maxRating')}")
        else:
            print("API Failed:", data.get('comment'))
    except Exception as e:
        print(f"API Exception: {e}")

    # 2. Scraping Check for Problems Solved
    # Since API doesn't give 'total solved' directly without fetching all submissions,
    # let's check the profile page text.
    page_url = f"https://codeforces.com/profile/{username}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        res = requests.get(page_url, headers=headers, timeout=10)
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(res.content, 'html.parser')
        
        # Look for the problem count. It's usually in a div like:
        # <div class="_UserActivityFrame_counterValue">2,028</div> 
        # (This is dynamic or varies).
        # OR usually "Friend of: x users" ... "Problem Solved: X" is simpler old view? 
        # Codeforces profile structure:
        # <div class="_UserActivityFrame_footer">
        #    <div class="_UserActivityFrame_countersRow">
        #       <div class="_UserActivityFrame_counter">
        #           <div class="_UserActivityFrame_counterValue">123</div>
        #           <div class="_UserActivityFrame_counterLabel">problems solved</div>
        
        # Searching for "problems solved" text
        
        # Simple text search
        text = soup.get_text()
        if "problems solved" in text:
            print("Found 'problems solved' in text.")
            
        # Try specific selector
        # They change classes often, but let's try finding the label "problems solved" and getting previous sibling
        labels = soup.find_all('div', string=lambda t: t and 'problems solved' in t.lower())
        for l in labels:
            print(f"Label found: {l}")
            parent = l.parent
            if parent:
                val = parent.find(class_=lambda x: x and 'counterValue' in x)
                if val:
                    print(f"Scraped Solved Count: {val.text}")
                    
    except Exception as e:
        print(f"Scraping Exception: {e}")

if __name__ == "__main__":
    check_codeforces("tourist") # The legend
