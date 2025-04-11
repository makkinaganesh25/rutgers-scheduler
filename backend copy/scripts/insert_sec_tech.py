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

def find_sec_tech_instances(df):
    """Locate all cells containing 'Sec. Tech.' and return their row and column indices."""
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if df.iloc[row, col] == "Sec. Tech.":
                locations.append((row, col))
    return locations

def extract_sec_tech_data(df, row, col):
    """Extract data for each instance of 'Sec. Tech.'."""
    date_row = row - 1
    day_row = row
    hours_rows = [row + 1, row + 2]
    officers_rows = [row + 1, row + 2]

    sec_tech_data = []

    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        day = df.iloc[day_row, i]
        
        if not date_str or not day:
            continue  # Skip if any key info is missing

        try:
            date = datetime.strptime(date_str, "%m/%d/%Y").date()

            for shift_index in range(2):  # Two shifts per day
                shift_hours = df.iloc[hours_rows[shift_index], col]
                if shift_hours:
                    shift_start_time, shift_end_time = shift_hours.split("-")

                    # Extract officer name and check for custom shift hours in parentheses
                    officer_name = df.iloc[officers_rows[shift_index], i]
                    updated_shift_start_time, updated_shift_end_time = parse_officer_shift_hours(officer_name, shift_start_time, shift_end_time)

                    sec_tech_data.append({
                        "day": day,
                        "date": date,
                        "shift_start_time": updated_shift_start_time,
                        "shift_end_time": updated_shift_end_time,
                        "officer": clean_officer_name(officer_name)
                    })
        except ValueError:
            continue

    return pd.DataFrame(sec_tech_data)

def parse_officer_shift_hours(officer_name, default_start, default_end):
    """Extract custom shift hours from officer name if specified, otherwise use default."""
    match = re.search(r'\((\d{4})-(\d{4})\)', officer_name)
    if match:
        return match.group(1), match.group(2)
    return default_start.strip(), default_end.strip()

def clean_officer_name(name):
    """Remove any details in parentheses from officer names to standardize."""
    if pd.isna(name) or name == "Summer Schedule" or name == "----------":
        return None
    return re.sub(r'\s*\(.*\)', '', name).strip()

def insert_missing_officers(data_df):
    """Check and insert any missing officers into the officers table."""
    all_officers = set(data_df["officer"].dropna())

    cursor.execute("SELECT name FROM officers")
    existing_officers = {row[0] for row in cursor.fetchall()}

    missing_officers = all_officers - existing_officers

    for officer in missing_officers:
        if officer:  # Check if the officer name is not empty
            cursor.execute("INSERT IGNORE INTO officers (name, contact_info) VALUES (%s, %s)", (officer, "N/A"))
            print(f"Officer '{officer}' added to officers table.")
    db.commit()

def insert_sec_tech_data(sec_tech_data_df):
    """Insert the extracted Sec. Tech. shift data into the database."""
    for _, entry in sec_tech_data_df.iterrows():
        cursor.execute(
            """
            INSERT INTO sec_tech_shifts (day, date, shift_start_time, shift_end_time, officer)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                entry["day"],
                entry["date"],
                entry["shift_start_time"],
                entry["shift_end_time"],
                entry["officer"]
            )
        )
    db.commit()
    print("Sec. Tech. shift data inserted successfully.")

def main():
    # Open the "Permanent Shifts" worksheet and convert to DataFrame
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("Sec Tech")
    all_data = sheet.get_all_values()
    df = pd.DataFrame(all_data)

    sec_tech_locations = find_sec_tech_instances(df)

    all_weeks_data = []

    for location in sec_tech_locations:
        row, col = location
        weekly_data = extract_sec_tech_data(df, row, col)
        all_weeks_data.append(weekly_data)

    sec_tech_data_df = pd.concat(all_weeks_data, ignore_index=True)

    print("Extracted Sec. Tech. Data:")
    print(sec_tech_data_df)

    insert_missing_officers(sec_tech_data_df)

    user_input = input("Do you want to insert this data into the database? (yes/no): ")
    if user_input.lower() == "yes":
        insert_sec_tech_data(sec_tech_data_df)
    else:
        print("Skipping insertion.")

# Run the main function
if __name__ == "__main__":
    main()
