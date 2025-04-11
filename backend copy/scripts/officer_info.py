import json
import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Database connection setup using environment variables
db_connection = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)
cursor = db_connection.cursor()

# Load JSON data
with open('officers_name.json', 'r') as file:
    officers_data = json.load(file)

# Insert data into the officers table
for officer in officers_data:
    name = officer.get("name")
    contact_info = officer.get("contact_info", "N/A")  # Default to 'N/A' if not provided

    # Insert into officers table
    cursor.execute("""
        INSERT INTO officers (name, contact_info)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE contact_info = VALUES(contact_info)
    """, (name, contact_info))

# Commit the transaction
db_connection.commit()
cursor.close()
db_connection.close()

print("Officer data inserted into the officers table successfully.")
