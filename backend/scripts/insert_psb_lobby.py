import os
import pandas as pd
from dotenv import load_dotenv
import gspread
import mysql.connector
from datetime import datetime
import re

load_dotenv()

gc = gspread.service_account(filename=os.getenv("GOOGLE_CREDENTIALS_JSON"))

db = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)
cursor = db.cursor()

def parse_time_str(time_str):
    """Attempts to parse various time formats into HH:MM:SS (24-hour)."""
    time_str = time_str.strip()
    for fmt in ['%H:%M', '%I:%M%p', '%H:%M:%S', '%H%M']:
        try:
            dt = datetime.strptime(time_str, fmt)
            return dt.strftime('%H:%M:%S')
        except ValueError:
            pass
    return None

def clean_officer_name(name):
    if pd.isna(name) or name in ["Summer Schedule", "----------"]:
        return None
    return re.sub(r'\s*\(.*\)', '', name).strip()

def find_psb_lobby_instances(df):
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if str(df.iat[row, col]).strip().lower() == "psb lobby":
                locations.append((row, col))
    return locations

def extract_psb_lobby_data(df, row, col):
    date_row = row - 1
    hours_rows = [row + 1, row + 2] 
    officers_rows = [row + 1, row + 2]

    extracted_data = []
    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        if not date_str:
            continue
        try:
            date_dt = datetime.strptime(date_str, "%m/%d/%Y").date()
        except ValueError:
            continue

        for j, hr_row in enumerate(hours_rows):
            shift_hours = df.iloc[hr_row, col]  # e.g. "08:00 - 12:30"
            if shift_hours and "-" in shift_hours:
                start_str, end_str = shift_hours.split("-")
                start_parsed = parse_time_str(start_str)
                end_parsed = parse_time_str(end_str)
                if not start_parsed or not end_parsed:
                    continue

                officer = df.iloc[officers_rows[j], i]
                officer = clean_officer_name(officer)
                if not officer:
                    continue

                extracted_data.append({
                    "shift_type": "PSB Lobby",
                    "date": date_dt,
                    "start_time": start_parsed,  # e.g. "08:00:00"
                    "end_time": end_parsed,      # e.g. "12:30:00"
                    "role": "Officer",
                    "officer_name": officer,
                    "sheet_name": "PSB Lobby",
                    "sheet_row": row + 1,  # or the correct row for that date in your sheet
                    "sheet_col": i + 1
                })
    return extracted_data

def insert_shift_data(shift_data):
    for shift in shift_data:
        cursor.execute("""
            INSERT INTO shifts 
              (shift_type, date, start_time, end_time, role, officer_name, sheet_name, sheet_row, sheet_col, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'open')
            ON DUPLICATE KEY UPDATE officer_name = VALUES(officer_name)
        """, (
            shift["shift_type"],
            shift["date"],
            shift["start_time"],
            shift["end_time"],
            shift["role"],
            shift["officer_name"],
            shift["sheet_name"],
            shift["sheet_row"],
            shift["sheet_col"]
        ))
    db.commit()
    print(f"Inserted {len(shift_data)} records into the shifts table.")

def main():
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("PSB Lobby")
    data = sheet.get_all_values()
    df = pd.DataFrame(data)

    locations = find_psb_lobby_instances(df)
    all_data = []
    for (row, col) in locations:
        all_data.extend(extract_psb_lobby_data(df, row, col))

    print("Extracted PSB LOBBY Data:")
    for rec in all_data:
        print(rec)

    user_input = input("Do you want to insert this data? (yes/no): ")
    if user_input.lower() == "yes":
        insert_shift_data(all_data)
    else:
        print("Skipping insertion.")

if __name__ == "__main__":
    main()
