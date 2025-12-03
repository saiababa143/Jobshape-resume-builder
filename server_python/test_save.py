import requests

# 1. Login to get user ID
login_url = "http://localhost:8000/api/auth/login"
login_payload = {
    "email": "test@example.com",
    "password": "password123"
}

try:
    print("Logging in...")
    login_response = requests.post(login_url, json=login_payload)
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        # Try signup if login fails
        print("Trying signup...")
        signup_url = "http://localhost:8000/api/auth/signup"
        signup_payload = {
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
        signup_response = requests.post(signup_url, json=signup_payload)
        if signup_response.status_code != 200:
             print(f"Signup failed: {signup_response.text}")
             user_id = 1 # Fallback assumption
        else:
             user_id = signup_response.json()["id"]
    else:
        user_id = login_response.json()["id"]
    
    print(f"User ID: {user_id}")

    # 2. Try to save resume
    save_url = "http://localhost:8000/api/resumes/save"
    save_payload = {
        "user_id": user_id,
        "fullName": "Test User",
        "email": "test@example.com",
        "phone": "1234567890",
        "summary": "Test Summary",
        "experience": [],
        "education": [],
        "skills": ["Python"]
    }
    
    print("Saving resume...")
    save_response = requests.post(save_url, json=save_payload)
    print(f"Save Status: {save_response.status_code}")
    print(save_response.text)

except Exception as e:
    print(f"Error: {e}")
