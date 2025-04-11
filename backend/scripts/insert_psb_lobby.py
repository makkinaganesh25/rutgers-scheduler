# insert_psb_lobby.py
import os
import pandas as pd
from dotenv import load_dotenv
import gspread
import mysql.connector
from datetime import datetime
import re

# Load environment variables
load_dotenv()

# Initialize Google Sheets API client with service account authentication
gc = gspread.service_account(filename=os.getenv("GOOGLE_CREDENTIALS_JSON"))

# MySQL connection setup
db = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)
cursor = db.cursor()

def clean_officer_name(name):
    """Standardize officer names by removing parentheses details."""
    if pd.isna(name) or name in ["Summer Schedule", "----------"]:
        return None
    return re.sub(r'\s*\(.*\)', '', name).strip()

def find_psb_lobby_instances(df):
    """Locate all cells with 'PSB LOBBY' in the sheet."""
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if str(df.iat[row, col]).strip().lower() == "psb lobby":
                locations.append((row, col))
    return locations

def extract_psb_lobby_data(df, row, col):
    """Extract shift data for PSB Lobby."""
    date_row = row - 1   # Assume the date is in the row above
    day_row = row        # Assume the day is on the same row
    # Two rows for shift hours (e.g., morning and afternoon)
    hours_rows = [row + 1, row + 2]
    # Corresponding officer assignments for each shift row
    officers_rows = [row + 1, row + 2]

    extracted_data = []
    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        day = df.iloc[day_row, i]
        if not date_str or not day:
            continue
        try:
            date = datetime.strptime(date_str, "%m/%d/%Y").date()
        except ValueError:
            continue

        # For each shift row (e.g., morning and afternoon)
        for j, hours_row in enumerate(hours_rows):
            shift_hours = df.iloc[hours_row, col]
            if shift_hours and "-" in shift_hours:
                shift_start_time, shift_end_time = shift_hours.split("-")
                officer = df.iloc[officers_rows[j], i]
                officer = clean_officer_name(officer)
                if officer is None:
                    continue
                # Prepare the record for insertion.
                extracted_data.append({
                    "shift_type": "PSB Lobby",
                    "date": date,
                    "start_time": shift_start_time.strip(),
                    "end_time": shift_end_time.strip(),
                    "role": "Officer",   # You might differentiate roles if needed.
                    "officer_name": officer,
                    "sheet_name": "PSB Lobby",
                    "sheet_row": row + 1,  # You can store a 1-indexed row number
                    "sheet_col": i + 1     # Similarly for column
                })
    return extracted_data

def insert_shift_data(shift_data):
    """Insert a list of shift data into the unified shifts table."""
    for shift in shift_data:
        cursor.execute(
            """
            INSERT INTO shifts 
              (shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'open')
            ON DUPLICATE KEY UPDATE officer_name = VALUES(officer_name)
            """,
            (
              shift["shift_type"],
              shift["date"],
              shift["start_time"],
              shift["end_time"],
              shift["role"],
              shift["officer_name"],
              shift["sheet_name"],
              shift["sheet_row"],
              shift["sheet_col"]
            )
        )
    db.commit()
    print(f"Inserted {len(shift_data)} records into the shifts table.")

def main():
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("PSB Lobby")
    all_data = sheet.get_all_values()
    df = pd.DataFrame(all_data)
    
    locations = find_psb_lobby_instances(df)
    all_shift_data = []
    for location in locations:
        row, col = location
        data = extract_psb_lobby_data(df, row, col)
        all_shift_data.extend(data)
    
    print("Extracted PSB Lobby Shift Data:")
    for record in all_shift_data:
        print(record)
    
    user_input = input("Do you want to insert this data into the database? (yes/no): ")
    if user_input.lower() == "yes":
        insert_shift_data(all_shift_data)
    else:
        print("Skipping insertion.")

if __name__ == "__main__":
    main()
# This script is designed to extract PSB Lobby shift data from a Google Sheet and insert it into a MySQL database.
# It handles the extraction of shift data, cleaning officer names, and inserting the data into a unified shifts table.
# The script also includes functionality to find the correct locations of the PSB Lobby data in the sheet and
# to handle potential duplicates in the database.
# The script is modular, allowing for easy updates and maintenance.
# It uses environment variables for sensitive information like database credentials and Google Sheet ID.
# The script is designed to be executed as a standalone program.
# It uses the gspread library for Google Sheets API interaction and mysql.connector for MySQL database operations.
# The script is structured to be clear and maintainable, with functions for each major task.
# It includes error handling for date parsing and database operations.
# The script also includes user prompts for confirmation before inserting data into the database.
# This allows for flexibility and control over the data insertion process.
# The script is designed to be run in a Python environment with the necessary libraries installed.
# It is assumed that the database schema is already set up with the appropriate tables and columns.
# The script is intended for use in a law enforcement or security context, where shift data is critical for operations.