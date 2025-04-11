# import os
# import pandas as pd
# from dotenv import load_dotenv
# import gspread
# import mysql.connector
# from datetime import datetime

# # Load environment variables
# load_dotenv()

# # Initialize Google Sheets API client with service account authentication
# gc = gspread.service_account(filename=os.getenv("GOOGLE_CREDENTIALS_JSON"))

# # MySQL connection setup
# db = mysql.connector.connect(
#     host=os.getenv("MYSQL_HOST"),
#     user=os.getenv("MYSQL_USER"),
#     password=os.getenv("MYSQL_PASSWORD"),
#     database=os.getenv("MYSQL_DATABASE")
# )
# cursor = db.cursor()

# def find_knight_mover_instances(df):
#     """Locate all cells containing 'KNIGHT MOVER' and return their row and column indices."""
#     locations = []
#     for row in range(df.shape[0]):
#         for col in range(df.shape[1]):
#             if df.iloc[row, col] == "KNIGHT MOVER":
#                 locations.append((row, col))
#     return locations

# def extract_knight_mover_data(df, row, col):
#     """Extract data for each instance of 'KNIGHT MOVER'."""
#     date_row = row - 1
#     day_row = row
#     hours_row = row + 1
#     dispatcher_rows = [row + 2, row + 3, row + 4]

#     knight_mover_data = []

#     for i in range(col + 1, df.shape[1]):
#         date_str = df.iloc[date_row, i]
#         day = df.iloc[day_row, i]
#         shift_hours = df.iloc[hours_row, i]

#         if not date_str or not day or not shift_hours:
#             continue  # Skip if any key info is missing

#         # Parse date and shift start/end times
#         date = datetime.strptime(date_str, "%m/%d/%Y").date()
#         shift_start_time, shift_end_time = shift_hours.split("-")

#         # Retrieve the dispatcher/driver assignments
#         dispatcher_driver_1 = df.iloc[dispatcher_rows[0], i]
#         dispatcher_driver_2 = df.iloc[dispatcher_rows[1], i]
#         dispatcher_driver_3 = df.iloc[dispatcher_rows[2], i]

#         knight_mover_data.append({
#             "day": day,
#             "date": date,
#             "shift_start_time": shift_start_time.strip(),
#             "shift_end_time": shift_end_time.strip(),
#             "dispatcher_driver_1": dispatcher_driver_1 if dispatcher_driver_1 != "----------" else None,
#             "dispatcher_driver_2": dispatcher_driver_2 if dispatcher_driver_2 != "----------" else None,
#             "dispatcher_driver_3": dispatcher_driver_3 if dispatcher_driver_3 != "----------" else None
#         })

#     return pd.DataFrame(knight_mover_data)  # Return as DataFrame for easy viewing

# def ensure_officers_exist(knight_mover_data_df):
#     """Check if all officers exist in the `officers` table and insert any missing officers."""
#     officers_to_check = set()
#     for _, row in knight_mover_data_df.iterrows():
#         if row["dispatcher_driver_1"]:
#             officers_to_check.add(row["dispatcher_driver_1"])
#         if row["dispatcher_driver_2"]:
#             officers_to_check.add(row["dispatcher_driver_2"])
#         if row["dispatcher_driver_3"]:
#             officers_to_check.add(row["dispatcher_driver_3"])

#     for officer in officers_to_check:
#         cursor.execute("SELECT name FROM officers WHERE name = %s", (officer,))
#         result = cursor.fetchone()
#         if not result:
#             cursor.execute("INSERT INTO officers (name, contact_info) VALUES (%s, 'N/A')", (officer,))
#     db.commit()
#     print("Ensured all officers exist in the officers table.")

# def insert_knight_mover_data(knight_mover_data_df):
#     """Insert the extracted Knight Mover shift data into the database."""
#     for _, entry in knight_mover_data_df.iterrows():
#         cursor.execute(
#             """
#             INSERT INTO knight_mover_shifts (day, date, shift_start_time, shift_end_time, dispatcher_driver_1, dispatcher_driver_2, dispatcher_driver_3)
#             VALUES (%s, %s, %s, %s, %s, %s, %s)
#             """,
#             (
#                 entry["day"],
#                 entry["date"],
#                 entry["shift_start_time"],
#                 entry["shift_end_time"],
#                 entry["dispatcher_driver_1"],
#                 entry["dispatcher_driver_2"],
#                 entry["dispatcher_driver_3"]
#             )
#         )
#     db.commit()
#     print("KNIGHT MOVER shift data inserted successfully.")

# def main():
#     # Open the "Permanent Shifts" worksheet and convert to DataFrame
#     sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("KNIGHT MOVER")
#     all_data = sheet.get_all_values()
#     df = pd.DataFrame(all_data)

#     # Find all "KNIGHT MOVER" instances
#     knight_mover_locations = find_knight_mover_instances(df)

#     # Loop over each "KNIGHT MOVER" instance to extract data
#     for location in knight_mover_locations:
#         row, col = location
#         knight_mover_data_df = extract_knight_mover_data(df, row, col)

#         # Display extracted data
#         print("Extracted KNIGHT MOVER Data:")
#         print(knight_mover_data_df)

#         # Prompt user to confirm insertion
#         user_input = input("Do you want to insert this data into the database? (yes/no): ")
#         if user_input.lower() == "yes":
#             ensure_officers_exist(knight_mover_data_df)
#             insert_knight_mover_data(knight_mover_data_df)
#         else:
#             print("Skipping insertion for this instance.")

# # Run the main function
# if __name__ == "__main__":
#     main()


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

def find_knight_mover_instances(df):
    """Locate all cells containing 'KNIGHT MOVER' and return their row and column indices."""
    locations = []
    for row in range(df.shape[0]):
        for col in range(df.shape[1]):
            if df.iloc[row, col] == "KNIGHT MOVER":
                locations.append((row, col))
    return locations

def extract_knight_mover_data(df, row, col):
    """Extract data for each instance of 'KNIGHT MOVER'."""
    date_row = row - 1
    day_row = row
    hours_row = row + 1
    dispatcher_rows = [row + 2, row + 3, row + 4]

    knight_mover_data = []

    for i in range(col + 1, df.shape[1]):
        date_str = df.iloc[date_row, i]
        day = df.iloc[day_row, i]
        shift_hours = df.iloc[hours_row, i]

        if not date_str or not day or not shift_hours:
            continue  # Skip if any key info is missing

        # Parse date and shift start/end times
        date = datetime.strptime(date_str, "%m/%d/%Y").date()
        shift_start_time, shift_end_time = shift_hours.split("-")

        # Retrieve the dispatcher/driver assignments
        dispatcher_driver_1 = df.iloc[dispatcher_rows[0], i]
        dispatcher_driver_2 = df.iloc[dispatcher_rows[1], i]
        dispatcher_driver_3 = df.iloc[dispatcher_rows[2], i]

        knight_mover_data.append({
            "day": day,
            "date": date,
            "shift_start_time": shift_start_time.strip(),
            "shift_end_time": shift_end_time.strip(),
            "dispatcher_driver_1": dispatcher_driver_1 if dispatcher_driver_1 != "----------" else None,
            "dispatcher_driver_2": dispatcher_driver_2 if dispatcher_driver_2 != "----------" else None,
            "dispatcher_driver_3": dispatcher_driver_3 if dispatcher_driver_3 != "----------" else None
        })

    return pd.DataFrame(knight_mover_data)

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

def insert_knight_mover_data(knight_mover_data_df):
    """Insert the extracted Knight Mover shift data into the database, with officer check."""
    # Get current officers
    current_officers = get_officer_names()
    
    # Collect all officer names in the data
    required_officers = set(knight_mover_data_df['dispatcher_driver_1'].dropna()).union(
        set(knight_mover_data_df['dispatcher_driver_2'].dropna()),
        set(knight_mover_data_df['dispatcher_driver_3'].dropna())
    )
    
    # Find missing officers
    missing_officers = required_officers - current_officers
    if missing_officers:
        print(f"Missing officers detected: {missing_officers}")
        insert_missing_officers(missing_officers)
    
    # Insert the shift data
    for _, entry in knight_mover_data_df.iterrows():
        cursor.execute(
            """
            INSERT INTO knight_mover_shifts (day, date, shift_start_time, shift_end_time, dispatcher_driver_1, dispatcher_driver_2, dispatcher_driver_3)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                entry["day"],
                entry["date"],
                entry["shift_start_time"],
                entry["shift_end_time"],
                entry["dispatcher_driver_1"],
                entry["dispatcher_driver_2"],
                entry["dispatcher_driver_3"]
            )
        )
    db.commit()
    print("KNIGHT MOVER shift data inserted successfully.")

def main():
    # Open the "Permanent Shifts" worksheet and convert to DataFrame
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("KNIGHT MOVER")
    all_data = sheet.get_all_values()
    df = pd.DataFrame(all_data)

    # Find all "KNIGHT MOVER" instances
    knight_mover_locations = find_knight_mover_instances(df)

    # Create an empty DataFrame to collect data from all weeks
    all_knight_mover_data = pd.DataFrame()

    # Loop over each "KNIGHT MOVER" instance to extract data
    for location in knight_mover_locations:
        row, col = location
        knight_mover_data_df = extract_knight_mover_data(df, row, col)
        all_knight_mover_data = pd.concat([all_knight_mover_data, knight_mover_data_df], ignore_index=True)

    # Display extracted data
    print("Extracted KNIGHT MOVER Data:")
    print(all_knight_mover_data)

    # Prompt user to confirm insertion
    user_input = input("Do you want to insert this data into the database? (yes/no): ")
    if user_input.lower() == "yes":
        insert_knight_mover_data(all_knight_mover_data)
    else:
        print("Skipping insertion.")

# Run the main function
if __name__ == "__main__":
    main()
