from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

try:
    hash = pwd_context.hash("password123")
    print(f"Hash: {hash}")
    print(f"Verify: {pwd_context.verify('password123', hash)}")
except Exception as e:
    print(f"Error: {e}")
