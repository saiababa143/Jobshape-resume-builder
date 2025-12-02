from database import init_db, engine
import sqlalchemy

print(f"SQLAlchemy version: {sqlalchemy.__version__}")

try:
    print("Attempting to initialize database...")
    init_db()
    print("Database initialized successfully!")
except Exception as e:
    print(f"Error initializing database: {e}")
    import traceback
    traceback.print_exc()
