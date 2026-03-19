import json
import os

files = [
    'server/users.json',
    'server/announcements.json'
]

def migrate():
    for file_path in files:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            updated = False
            if isinstance(data, list):
                for item in data:
                    if 'department' not in item:
                        item['department'] = 'AIML'
                        updated = True
            
            if updated:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f"Updated {file_path}")
            else:
                print(f"No changes needed for {file_path}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == '__main__':
    migrate()
