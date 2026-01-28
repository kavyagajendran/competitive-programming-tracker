from bs4 import BeautifulSoup
import re

fname = 'debug_fail.html'
try:
    with open(fname, 'r', encoding='utf-8') as f:
        html_content = f.read()
except FileNotFoundError:
    print(f"File {fname} not found. Please run the fetch debug step first.")
    exit(1)

soup = BeautifulSoup(html_content, 'html.parser')
stats = {}

print("--- Debugging Star Rating ---")
# Try finding span with class rating
star_span = soup.find('span', class_='rating')
if star_span:
    print(f"Found star_span: {star_span}")
    print(f"Text: {star_span.text.strip()}")
    stats['star_rating'] = star_span.text.strip()
else:
    print("Star span not found")
    # visual fallback: count stars in rating-star div?
    rating_star_div = soup.find('div', class_='rating-star')
    if rating_star_div:
        stars = rating_star_div.find_all('span')
        print(f"Found {len(stars)} stars in rating-star div")

print("\n--- Debugging Total Solved ---")
# Try finding h3 with "Total Problems Solved"
# Note: text=... in find is deprecated in newer bs4, use string=... or check text manually
problems_solved_section = soup.find('section', class_='problems-solved')
if problems_solved_section:
    h3s = problems_solved_section.find_all('h3')
    for h3 in h3s:
        print(f"Checking h3: {h3.text.strip()}")
        if 'Total Problems Solved' in h3.text:
            txt = h3.text.strip()
            nums = re.findall(r'\d+', txt)
            if nums:
                stats['total_solved'] = int(nums[0])
                print(f"Parsed Total Solved: {stats['total_solved']}")
else:
    print("problems-solved section not found")

print("\n--- Final Stats Helpers ---")
print(stats)
