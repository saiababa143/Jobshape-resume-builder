import pymysql

def create_database():
    try:
        # Connect to MySQL server (no database selected yet)
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password=''
        )
        cursor = connection.cursor()
        
        # Create database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS resume_builder")
        print("Database 'resume_builder' checked/created successfully.")
        
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
