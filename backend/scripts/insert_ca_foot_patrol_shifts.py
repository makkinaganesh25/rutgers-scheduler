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

def find_ca_foot_patrol_instances(df):
    """Locate all cells containing 'CA FOOT PATROL' and return their row and column indices."""
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if df.iloc[row, col] == "CA FOOT PATROL":
                locations.append((row, col))
    return locations

def extract_ca_foot_patrol_data(df, row, col):
    """Extract data for each instance of 'CA FOOT PATROL'."""
    date_row = row - 1
    day_row = row
    hours_rows = [row + 1, row + 2]
    officers_rows = [row + 1, row + 2]

    ca_foot_patrol_data = []

    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        day = df.iloc[day_row, i]
        shift_hours = df.iloc[hours_rows[0], col]  

        if not date_str or not day or not shift_hours:
            continue

        try:
            date = datetime.strptime(date_str, "%m/%d/%Y").date()
            shift_start_time, shift_end_time = shift_hours.split("-")

            officer_1 = df.iloc[officers_rows[0], i]
            officer_2 = df.iloc[officers_rows[1], i]

            ca_foot_patrol_data.append({
                "day": day,
                "date": date,
                "shift_start_time": shift_start_time.strip(),
                "shift_end_time": shift_end_time.strip(),
                "officer_1": clean_officer_name(officer_1),
                "officer_2": clean_officer_name(officer_2)
            })

        except ValueError:
            continue  

    return pd.DataFrame(ca_foot_patrol_data)

def clean_officer_name(name):
    """Remove any details in parentheses from officer names to standardize."""
    if pd.isna(name) or name == "Summer Schedule":
        return None
    return re.sub(r'\s*\(.*\)', '', name).strip()

def insert_missing_officers(data_df):
    """Check and insert any missing officers into the officers table."""
    all_officers = set(data_df["officer_1"].dropna()).union(set(data_df["officer_2"].dropna()))

    cursor.execute("SELECT name FROM officers")
    existing_officers = {row[0] for row in cursor.fetchall()}

    missing_officers = all_officers - existing_officers

    for officer in missing_officers:
        if officer:  # Check if the officer name is not empty
            cursor.execute("INSERT IGNORE INTO officers (name, contact_info) VALUES (%s, %s)", (officer, "N/A"))
            print(f"Officer '{officer}' added to officers table.")
    db.commit()

def insert_ca_foot_patrol_data(ca_foot_patrol_data_df):
    """Insert the extracted CA FOOT PATROL shift data into the database."""
    for _, entry in ca_foot_patrol_data_df.iterrows():
        cursor.execute(
            """
            INSERT INTO ca_foot_patrol_shifts (day, date, shift_start_time, shift_end_time, officer_1, officer_2)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                entry["day"],
                entry["date"],
                entry["shift_start_time"],
                entry["shift_end_time"],
                entry["officer_1"],
                entry["officer_2"]
            )
        )
    db.commit()
    print("CA FOOT PATROL shift data inserted successfully.")

def main():
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("CA Foot Patrol")
    all_data = sheet.get_all_values()
    df = pd.DataFrame(all_data)

    ca_foot_patrol_locations = find_ca_foot_patrol_instances(df)

    all_weeks_data = []

    for location in ca_foot_patrol_locations:
        row, col = location
        weekly_data = extract_ca_foot_patrol_data(df, row, col)
        all_weeks_data.append(weekly_data)

    ca_foot_patrol_data_df = pd.concat(all_weeks_data, ignore_index=True)

    print("Extracted CA FOOT PATROL Data:")
    print(ca_foot_patrol_data_df)

    insert_missing_officers(ca_foot_patrol_data_df)

    user_input = input("Do you want to insert this data into the database? (yes/no): ")
    if user_input.lower() == "yes":
        insert_ca_foot_patrol_data(ca_foot_patrol_data_df)
    else:
        print("Skipping insertion.")

# Run the main function
if __name__ == "__main__":
    main()
