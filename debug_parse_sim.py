from bs4 import BeautifulSoup
import re

with open('debug_fail.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')
stats = {
    "username": "kit23bam025",
    "platform": "CodeChef"
}

try:
    # Rating Header
    rating_header = soup.find('div', class_='rating-header')
    print(f"Rating Header Found: {rating_header is not None}")
    
    if rating_header:
        rating_div = rating_header.find('div', class_='rating-number')
        print(f"Rating Div Found: {rating_div}")
        stats['current_rating'] = int(rating_div.text.strip()) if rating_div else 0
        
        # Star Rating
        star_span = rating_header.find('span', class_='rating') # <span class="rating"> is not in the HTML?
        # In HTML: <div class="rating-star"><span ...>&#9733;</span>...</div>
        # But wait, lines 60-61 of codechef_api.py:
        # star_span = rating_header.find('span', class_='rating') 
        # In the HTML I see: <a href="/ratings/all" class="rating">1415 ...</a> which is inside .rank-stats?
        # NO, looking at lines 712-719 of HTML:
        # <div class="rating-header text-center">
        # ...
        # <div class="rating-star"><span ...>&#9733;</span>...</div>
        
        print(f"Star Span search result: {rating_header.find('span', class_='rating')}")
        
        # It seems the class 'rating' might not be on a span in the header?
        # In the HTML: <a href="/ratings"><strong>CodeChef Rating</strong></a>
        
        highest_rating_div = rating_header.find('small')
        if highest_rating_div:
            txt = highest_rating_div.text.strip()
            print(f"Highest Rating Text: {txt}")
            nums = re.findall(r'\d+', txt)
            stats['highest_rating'] = int(nums[0]) if nums else 0

    print("Stats so far:", stats)

    # Ranks
    rating_ranks = soup.find('div', class_='rating-ranks')
    print(f"Rating Ranks Found: {rating_ranks is not None}")
    if rating_ranks:
        strongs = rating_ranks.find_all('strong')
        print(f"Strongs found: {len(strongs)}")
        if len(strongs) >= 2:
            stats['global_ranking'] = strongs[0].text.strip()
            stats['country_ranking'] = strongs[1].text.strip()

    print("Final Stats:", stats)

except Exception as e:
    print(f"parsing failed: {e}")
    import traceback
    traceback.print_exc()
