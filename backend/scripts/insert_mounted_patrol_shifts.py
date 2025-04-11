import os
import pandas as pd
from dotenv import load_dotenv
import gspread
import mysql.connector
from datetime import datetime

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

def find_mounted_patrol_instances(df):
    """Locate all cells containing 'MOUNTED PATROL' and return their row and column indices."""
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if df.iloc[row, col] == "MOUNTED PATROL":
                locations.append((row, col))
    return locations

def extract_mounted_patrol_data(df, row, col):
    """Extract data for each instance of 'MOUNTED PATROL'."""
    date_row = row - 1
    day_row = row
    campus_row = row + 1
    hours_row = row + 2
    oic_row = row + 3
    rider_row = row + 4

    mounted_patrol_data = []

    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        day = df.iloc[day_row, i]
        campus = df.iloc[campus_row, i]
        shift_hours = df.iloc[hours_row, i]
        oic = df.iloc[oic_row, i]
        rider = df.iloc[rider_row, i]

        if not date_str or not day or not shift_hours:
            continue  # Skip if any key info is missing

        # Parse date and shift start/end times
        date = datetime.strptime(date_str, "%m/%d/%Y").date()
        shift_start_time, shift_end_time = shift_hours.split("-")

        mounted_patrol_data.append({
            "day": day,
            "date": date,
            "campus": campus if campus else "C/D",
            "shift_start_time": shift_start_time.strip(),
            "shift_end_time": shift_end_time.strip(),
            "oic": oic if oic != "----------" else None,
            "rider": rider if rider != "----------" else None
        })

    return pd.DataFrame(mounted_patrol_data)

def get_officer_names():
    """Retrieve a set of all officer names in the officers table."""
    cursor.execute("SELECT name FROM officers")
    return {row[0] for row in cursor.fetchall()}

def insert_missing_officers(names):
    """Insert any missing officer names into the officers table."""
    for name in names:
        cursor.execute(
            "INSERT IGNORE INTO officers (name, contact_info) VALUES (%s, %s)",
            (name, "N/A")
        )
    db.commit()
    print("Missing officers inserted into the database.")

def insert_mounted_patrol_data(mounted_patrol_data_df):
    """Insert the extracted Mounted Patrol shift data into the database."""
    current_officers = get_officer_names()

    # Collect all officer names in the data
    required_officers = set(mounted_patrol_data_df['oic'].dropna()).union(
        set(mounted_patrol_data_df['rider'].dropna())
    )

    # Find missing officers
    missing_officers = required_officers - current_officers
    if missing_officers:
        print(f"Missing officers detected: {missing_officers}")
        insert_missing_officers(missing_officers)

    # Insert the shift data
    for _, entry in mounted_patrol_data_df.iterrows():
        cursor.execute(
            """
            INSERT INTO mounted_patrol_shifts (day, date, campus, shift_start_time, shift_end_time, oic, rider)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                entry["day"],
                entry["date"],
                entry["campus"],
                entry["shift_start_time"],
                entry["shift_end_time"],
                entry["oic"],
                entry["rider"]
            )
        )
    db.commit()
    print("MOUNTED PATROL shift data inserted successfully.")

def main():
    # Open the "Permanent Shifts" worksheet and convert to DataFrame
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("Mounted Patrol")
    all_data = sheet.get_all_values()
    df = pd.DataFrame(all_data)

    # Find all "MOUNTED PATROL" instances
    mounted_patrol_locations = find_mounted_patrol_instances(df)

    # Create an empty DataFrame to collect data from all weeks
    all_mounted_patrol_data = pd.DataFrame()

    # Loop over each "MOUNTED PATROL" instance to extract data
    for location in mounted_patrol_locations:
        row, col = location
        mounted_patrol_data_df = extract_mounted_patrol_data(df, row, col)
        all_mounted_patrol_data = pd.concat([all_mounted_patrol_data, mounted_patrol_data_df], ignore_index=True)

    # Display extracted data
    print("Extracted MOUNTED PATROL Data:")
    print(all_mounted_patrol_data)

    # Prompt user to confirm insertion
    user_input = input("Do you want to insert this data into the database? (yes/no): ")
    if user_input.lower() == "yes":
        insert_mounted_patrol_data(all_mounted_patrol_data)
    else:
        print("Skipping insertion.")

# Run the main function
if __name__ == "__main__":
    main()
