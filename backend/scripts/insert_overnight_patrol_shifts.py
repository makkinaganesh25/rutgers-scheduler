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

def find_overnight_patrol_instances(df):
    """Locate all cells containing 'OVERNIGHT PATROL' and return their row and column indices."""
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if df.iloc[row, col] == "OVERNIGHT PATROL":
                locations.append((row, col))
    return locations

def extract_overnight_patrol_data(df, row, col):
    """Extract data for each instance of 'OVERNIGHT PATROL'."""
    date_row = row - 1
    hours_row = row + 1
    officers_start_row = row + 2
    officers_end_row = officers_start_row + 5  # Typically 6 rows of officers

    # Ensure rows are within bounds
    if hours_row >= df.shape[0] or date_row >= df.shape[0] or officers_end_row >= df.shape[0]:
        print(f"Skipping extraction due to out-of-bounds row at starting row {row}")
        return []

    shift_hours_data = df.iloc[hours_row, col]  # Contains both hours and "OIC" designation
    if "OIC" in shift_hours_data:
        shift_hours, oic_marker = shift_hours_data.split(" OIC")
        oic_marker = "OIC"
    else:
        shift_hours = shift_hours_data.strip()
        oic_marker = None

    try:
        shift_start_time, shift_end_time = shift_hours.split("-")
        shift_start_time, shift_end_time = shift_start_time.strip(), shift_end_time.strip()
    except ValueError:
        print(f"Incorrect shift_hours format at row {hours_row + 1}")
        return []  # Return an empty list to skip problematic entries

    # Extract date, day, and officer assignments
    weekly_data = []
    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        day = df.iloc[row, i]
        oic = df.iloc[hours_row, i] if oic_marker else None
        if not date_str or not day:
            continue  # Skip if any key info is missing

        # Parse date
        date = datetime.strptime(date_str, "%m/%d/%Y").date()

        # Retrieve the officer assignments, ensuring they are within bounds
        officers = [
            df.iloc[officer_row, i] if officer_row < df.shape[0] else None
            for officer_row in range(officers_start_row, officers_end_row + 1)
        ]
        officers = [officer if officer not in ["----------", "Summer Schedule"] else None for officer in officers]

        weekly_data.append({
            "day": day,
            "date": date,
            "shift_start_time": shift_start_time,
            "shift_end_time": shift_end_time,
            "oic": oic if oic != "----------" else None,
            "officers": [officer for officer in officers if officer is not None]  # Filter out None entries
        })

    return weekly_data

def main():
    # Open the "Permanent Shifts" worksheet and convert to DataFrame
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("Overnight Patrol")
    all_data = sheet.get_all_values()
    df = pd.DataFrame(all_data)

    # Find all "OVERNIGHT PATROL" instances and consolidate all extracted data
    all_overnight_patrol_data = []
    overnight_patrol_locations = find_overnight_patrol_instances(df)
    for location in overnight_patrol_locations:
        row, col = location
        weekly_data = extract_overnight_patrol_data(df, row, col)
        all_overnight_patrol_data.extend(weekly_data)

    # Display extracted data
    overnight_patrol_data_df = pd.DataFrame(all_overnight_patrol_data)
    print("Extracted OVERNIGHT PATROL Data:")
    print(overnight_patrol_data_df)

    # Prompt user to confirm insertion
    user_input = input("Do you want to insert this data into the database? (yes/no): ")
    if user_input.lower() == "yes":
        insert_overnight_patrol_data(all_overnight_patrol_data)
    else:
        print("Data insertion canceled.")

def insert_overnight_patrol_data(overnight_patrol_data):
    """Insert the extracted overnight patrol shift data into the database."""
    for entry in overnight_patrol_data:
        officers = entry["officers"]

        # Ensure each officer exists in the officers table
        for officer in officers + [entry["oic"]]:
            if officer and officer not in ["----------", "Summer Schedule"]:
                cursor.execute("SELECT COUNT(*) FROM officers WHERE name = %s", (officer,))
                if cursor.fetchone()[0] == 0:
                    cursor.execute("INSERT INTO officers (name) VALUES (%s)", (officer,))
                    print(f"Officer '{officer}' added to officers table.")

        # Insert shift data into the overnight_patrol_shifts table
        cursor.execute(
            """
            INSERT INTO overnight_patrol_shifts (
                day, date, shift_start_time, shift_end_time, oic, officer_1, officer_2, officer_3, officer_4, officer_5, officer_6
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                entry["day"],
                entry["date"],
                entry["shift_start_time"],
                entry["shift_end_time"],
                entry["oic"],
                officers[0] if len(officers) > 0 else None,
                officers[1] if len(officers) > 1 else None,
                officers[2] if len(officers) > 2 else None,
                officers[3] if len(officers) > 3 else None,
                officers[4] if len(officers) > 4 else None,
                officers[5] if len(officers) > 5 else None,
            )
        )
    db.commit()
    print("OVERNIGHT PATROL shift data inserted successfully.")

# Run the main function
if __name__ == "__main__":
    main()
