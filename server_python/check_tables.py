from database import engine
from sqlalchemy import inspect

try:
    insp = inspect(engine)
    print("Tables:", insp.get_table_names())
except Exception as e:
    print(f"Error inspecting DB: {e}")
