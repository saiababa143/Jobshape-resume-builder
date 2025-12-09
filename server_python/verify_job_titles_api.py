import requests
import sys

def test_job_titles_api():
    base_url = "http://localhost:8000"
    
    print("Testing Job Titles API...")
    
    # Test 1: Generic List (No query)
    try:
        response = requests.get(f"{base_url}/api/job-titles")
        if response.status_code == 200:
            titles = response.json()
            print(f"[PASS] Generic List: Got {len(titles)} titles. Sample: {titles[:3]}")
        else:
            print(f"[FAIL] Generic List: Status {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Generic List: Connection Error: {e}")

    # Test 2: Search Query "Engineer"
    try:
        response = requests.get(f"{base_url}/api/job-titles?query=Engineer")
        if response.status_code == 200:
            titles = response.json()
            if len(titles) > 0 and all("engineer" in t.lower() for t in titles):
                print(f"[PASS] Search 'Engineer': Got {len(titles)} relevant titles. Sample: {titles[:3]}")
            else:
                print(f"[FAIL] Search 'Engineer': Returned {titles}")
        else:
            print(f"[FAIL] Search 'Engineer': Status {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Search 'Engineer': Connection Error: {e}")

    # Test 3: Search Query "XYZ" (Empty)
    try:
        response = requests.get(f"{base_url}/api/job-titles?query=XYZImpossibleTitle")
        if response.status_code == 200:
            titles = response.json()
            if len(titles) == 0:
                print(f"[PASS] Search 'XYZ': Correctly returned empty list.")
            else:
                print(f"[FAIL] Search 'XYZ': Should be empty but got {titles}")
        else:
            print(f"[FAIL] Search 'XYZ': Status {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Search 'XYZ': Connection Error: {e}")

if __name__ == "__main__":
    test_job_titles_api()
