import unittest
from unittest.mock import MagicMock
import sys
import os

# Ensure worker module can be imported
sys.path.append(os.getcwd())

from worker.codechef_api import get_codechef_stats
import requests

class TestCodeChefParsing(unittest.TestCase):
    def test_parsing_local_html(self):
        # Load local HTML
        with open('debug_fail.html', 'rb') as f:
            html_content = f.read()

        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = html_content
        
        # Patch requests.get
        original_get = requests.get
        requests.get = MagicMock(return_value=mock_response)
        
        try:
            stats = get_codechef_stats('kit23bam025')
            print("Parsed Stats:", stats)
            
            self.assertIsNotNone(stats, "Stats should not be None")
            self.assertEqual(stats.get('username'), 'kit23bam025')
            self.assertEqual(stats.get('star_rating'), '2★', f"Star rating mismatch. Got: {stats.get('star_rating')}")
            self.assertEqual(stats.get('total_solved'), 774, f"Total solved mismatch. Got: {stats.get('total_solved')}")
            # Rating 1415 -> Div 3
            self.assertEqual(stats.get('division'), 'Div 3', f"Division mismatch. Got: {stats.get('division')}")
            
            print("\nSUCCESS: Parsing logic verified!")
            
        finally:
            requests.get = original_get

if __name__ == '__main__':
    unittest.main()
