import requests

def test_kontests():
    url = "https://kontests.net/api/v1/codeforces"
    print(f"Testing {url}...")
    try:
        res = requests.get(url, timeout=10)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"Found {len(data)} contests")
            if len(data) > 0:
                print("First contest:", data[0])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kontests()
