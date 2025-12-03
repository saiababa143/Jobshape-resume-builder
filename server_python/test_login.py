import requests

url = "http://localhost:8000/api/auth/login"
payload = {
    "email": "test@example.com",
    "password": "password123"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
