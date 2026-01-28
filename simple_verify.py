from worker.codechef_api import get_codechef_stats
from unittest.mock import MagicMock
import requests

# Load local HTML
with open('debug_fail.html', 'rb') as f:
    html_content = f.read()

# Mock
mock_resp = MagicMock()
mock_resp.status_code = 200
mock_resp.content = html_content
requests.get = MagicMock(return_value=mock_resp)

stats = get_codechef_stats('kit23bam025')
print("Stats:", stats)

div = stats.get('division')
rating = stats.get('current_rating')
print(f"Parsed Rating: {rating}")
print(f"Division: '{div}'")

if div == 'Div 2':
    print("SUCCESS: Division matches 'Div 2'")
else:
    print(f"FAILURE: Division '{div}' != 'Div 2'")
