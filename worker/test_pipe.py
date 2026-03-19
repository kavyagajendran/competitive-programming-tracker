import json
data = [{"id": 1, "name": "Test Contest", "platform": "Codeforces"}]
with open('test_pipe.json', 'w') as f:
    json.dump(data, f)
print("File written")
