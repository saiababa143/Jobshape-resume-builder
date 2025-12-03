import requests

url = "http://localhost:8000/api/auth/signup"
payload = {
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
