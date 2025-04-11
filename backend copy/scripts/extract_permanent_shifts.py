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

# Function to insert extracted data into the database
def insert_shift_data(shift_data):
    for shift in shift_data:
        cursor.execute("""
            INSERT INTO shift_template (shift_name, day, start_time, end_time, role, officer_name)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            shift['shift_name'],
            shift['day'],
            shift['shift_start_time'],
            shift['shift_end_time'],
            shift['role'],
            shift['officer_name']
        ))
    db.commit()
    print(f"Inserted {len(shift_data)} records into the database.")

# Function to extract Knight Mover shifts
def extract_knight_mover_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    knight_mover_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() in ['knight mover', 'km']:
                knight_mover_row = row
                day_row = row
                shift_hours_row = row + 1
                dispatcher_driver_row_start = row + 2
                dispatcher_driver_row_end = row + 4

                days = df.iloc[day_row, col+1:col+8].values
                shift_hours = df.iloc[shift_hours_row, col+1:col+8].values

                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    shift_time = shift_hours[i]
                    if pd.isna(shift_time) or shift_time == '----------':
                        continue
                    
                    try:
                        shift_start_time, shift_end_time = shift_time.split("-")
                    except ValueError:
                        print(f"Unexpected format in shift hours: {shift_time}")
                        continue

                    for dispatcher_row in range(dispatcher_driver_row_start, dispatcher_driver_row_end + 1):
                        officer_name = df.iat[dispatcher_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        knight_mover_data.append({
                            'shift_name': 'KNIGHT MOVER',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Dispatcher/Driver',
                            'officer_name': officer_name.strip()
                        })
                
                return knight_mover_data
    return []

# Function to extract CA Foot Patrol shifts
def extract_ca_foot_patrol_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    ca_foot_patrol_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'ca foot patrol':
                ca_foot_patrol_row = row
                day_row = row
                shift_hours_row_start = row + 1
                shift_hours_row_end = row + 2

                days = df.iloc[day_row, col+1:col+8].values

                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    for shift_row in range(shift_hours_row_start, shift_hours_row_end + 1):
                        shift_time = df.iat[shift_row, col]
                        if pd.isna(shift_time):
                            continue
                        
                        try:
                            shift_start_time, shift_end_time = shift_time.split("-")
                        except ValueError:
                            print(f"Unexpected format in shift hours: {shift_time}")
                            continue

                        officer_name = df.iat[shift_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        ca_foot_patrol_data.append({
                            'shift_name': 'CA FOOT PATROL',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Officer',
                            'officer_name': officer_name.strip()
                        })
                
                return ca_foot_patrol_data
    return []

# Function to extract Mounted Patrol shifts
def extract_mounted_patrol_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    mounted_patrol_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'mounted patrol':
                day_row = row
                shift_hours_row = row + 1
                oic_row = row + 2
                rider_row = row + 3

                days = df.iloc[day_row, col+1:col+8].values
                shift_hours = df.iloc[shift_hours_row, col+1:col+8].values
                oic_officers = df.iloc[oic_row, col+1:col+8].values
                rider_officers = df.iloc[rider_row, col+1:col+8].values

                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    shift_time = shift_hours[i]
                    if pd.isna(shift_time):
                        continue
                    
                    try:
                        shift_start_time, shift_end_time = shift_time.split("-")
                    except ValueError:
                        print(f"Unexpected format in shift hours: {shift_time}")
                        continue

                    # OIC role entry
                    if not pd.isna(oic_officers[i]) and oic_officers[i] != '----------':
                        mounted_patrol_data.append({
                            'shift_name': 'MOUNTED PATROL',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'OIC',
                            'officer_name': oic_officers[i].strip()
                        })

                    # Rider role entry
                    if not pd.isna(rider_officers[i]) and rider_officers[i] != '----------':
                        mounted_patrol_data.append({
                            'shift_name': 'MOUNTED PATROL',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Rider',
                            'officer_name': rider_officers[i].strip()
                        })
                
                return mounted_patrol_data
    return []

# Function to extract PSB Lobby shifts
def extract_psb_lobby_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    psb_lobby_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'psb lobby':
                psb_lobby_row = row
                day_row = row
                shift_hours_row_start = row + 1
                shift_hours_row_end = row + 2

                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns

                # Traverse each day column
                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    # Extract shift hours and assigned officers
                    for shift_row in range(shift_hours_row_start, shift_hours_row_end + 1):
                        shift_time = df.iat[shift_row, col]
                        if pd.isna(shift_time):
                            continue
                        
                        try:
                            shift_start_time, shift_end_time = shift_time.split("-")
                        except ValueError:
                            print(f"Unexpected format in shift hours: {shift_time}")
                            continue

                        officer_name = df.iat[shift_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        psb_lobby_data.append({
                            'shift_name': 'PSB LOBBY',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Officer',
                            'officer_name': officer_name.strip()
                        })
                
                return psb_lobby_data
    return []


# Function to extract Civic Square shifts
def extract_civic_square_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    civic_square_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'civic square':
                day_row = row
                shift_hours_row_start = row + 1
                shift_hours_row_end = row + 2

                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns

                # Traverse each day column
                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    # Extract shift hours and assigned officers
                    for shift_row in range(shift_hours_row_start, shift_hours_row_end + 1):
                        shift_time = df.iat[shift_row, col]
                        if pd.isna(shift_time):
                            continue
                        
                        try:
                            shift_start_time, shift_end_time = shift_time.split("-")
                        except ValueError:
                            print(f"Unexpected format in shift hours: {shift_time}")
                            continue

                        officer_name = df.iat[shift_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        civic_square_data.append({
                            'shift_name': 'Civic Square',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Officer',
                            'officer_name': officer_name.strip()
                        })
                
                return civic_square_data
    return []

# Function to extract Sec. Tech. shifts
def extract_sec_tech_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    sec_tech_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'sec. tech.':
                day_row = row
                shift_hours_row_start = row + 1
                shift_hours_row_end = row + 2

                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns

                # Traverse each day column
                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    # Extract shift hours and assigned officers
                    for shift_row in range(shift_hours_row_start, shift_hours_row_end + 1):
                        shift_time = df.iat[shift_row, col]
                        if pd.isna(shift_time):
                            continue
                        
                        try:
                            shift_start_time, shift_end_time = shift_time.split("-")
                        except ValueError:
                            print(f"Unexpected format in shift hours: {shift_time}")
                            continue

                        officer_name = df.iat[shift_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        sec_tech_data.append({
                            'shift_name': 'Sec. Tech.',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Officer',
                            'officer_name': officer_name.strip()
                        })
                
                return sec_tech_data
    return []

# Function to extract RBS Back Entrance shifts
def extract_rbs_back_entrance_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    rbs_back_entrance_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'rbs back entrance':
                day_row = row
                shift_hours_row = row + 1

                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns
                shift_time = df.iat[shift_hours_row, col]

                try:
                    shift_start_time, shift_end_time = shift_time.split("-")
                except ValueError:
                    print(f"Unexpected format in shift hours: {shift_time}")
                    continue

                # Traverse each day column to get officer names
                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    officer_name = df.iat[shift_hours_row, col + 1 + i]
                    if pd.isna(officer_name) or officer_name == '----------':
                        continue
                    
                    rbs_back_entrance_data.append({
                        'shift_name': 'RBS Back Entrance',
                        'day': day,
                        'shift_start_time': shift_start_time.strip(),
                        'shift_end_time': shift_end_time.strip(),
                        'role': 'Officer',
                        'officer_name': officer_name.strip()
                    })
                
                return rbs_back_entrance_data
    return []

# Function to extract RBS Front Entrance shifts
def extract_rbs_front_entrance_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    rbs_front_entrance_data = []
    
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'rbs front entrance':
                day_row = row
                shift_hours_row = row + 1

                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns
                shift_time = df.iat[shift_hours_row, col]

                try:
                    shift_start_time, shift_end_time = shift_time.split("-")
                except ValueError:
                    print(f"Unexpected format in shift hours: {shift_time}")
                    continue

                # Traverse each day column to get officer names
                for i, day in enumerate(days):
                    if pd.isna(day):
                        continue
                    
                    officer_name = df.iat[shift_hours_row, col + 1 + i]
                    if pd.isna(officer_name) or officer_name == '----------':
                        continue
                    
                    rbs_front_entrance_data.append({
                        'shift_name': 'RBS Front Entrance',
                        'day': day,
                        'shift_start_time': shift_start_time.strip(),
                        'shift_end_time': shift_end_time.strip(),
                        'role': 'Officer',
                        'officer_name': officer_name.strip()
                    })
                
                return rbs_front_entrance_data
    return []

# Function to extract Supervisor Hours shifts
def extract_supervisor_hours_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    supervisor_hours_data = []
    
    # Locate 'Supervisor Hours' keyword in the sheet to find starting row and day columns
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'supervisor hours':
                day_row = row
                shift_hours_row_start = row + 1  # Row containing the first shift hours
                shift_hours_row_end = row + 2    # Row containing the second shift hours

                # Extract days (Saturday to Friday)
                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns

                # Traverse each shift hours row (two shifts per day)
                for shift_row in range(shift_hours_row_start, shift_hours_row_end + 1):
                    shift_time = df.iat[shift_row, col]
                    try:
                        shift_start_time, shift_end_time = shift_time.split("-")
                    except ValueError:
                        print(f"Unexpected format in shift hours: {shift_time}")
                        continue

                    # Traverse each day column to get officer names
                    for i, day in enumerate(days):
                        if pd.isna(day):
                            continue
                        
                        officer_name = df.iat[shift_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        supervisor_hours_data.append({
                            'shift_name': 'Supervisor Hours',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': 'Supervisor',
                            'officer_name': officer_name.strip()
                        })
                
                return supervisor_hours_data
    return []

# Function to extract Overnight Patrol shifts
# Function to extract Overnight Patrol shifts
def extract_overnight_patrol_shifts(sheet):
    data = sheet.get_all_values()
    df = pd.DataFrame(data)
    
    overnight_patrol_data = []
    
    # Locate 'Overnight Patrol' keyword in the sheet to find starting row and day columns
    for row in range(len(df)):
        for col in range(len(df.columns)):
            if str(df.iat[row, col]).strip().lower() == 'overnight patrol':
                day_row = row  # Row with day headers
                shift_row_start = row + 1  # Row containing first shift (OIC row)
                shift_row_end = row + 6    # Last shift row for "Overnight Patrol"

                # Extract days (Saturday to Friday)
                days = df.iloc[day_row, col+1:col+8].values  # Saturday to Friday columns

                # Traverse each shift row for the shift hours and role (OIC, FTO, etc.)
                for shift_row in range(shift_row_start, shift_row_end + 1):
                    shift_info = str(df.iat[shift_row, col])

                    # Separate shift time and role for the first row (e.g., "2300 - 0300 OIC")
                    if shift_row == shift_row_start and " " in shift_info:
                        time_role_split = shift_info.rsplit(" ", 1)
                        shift_time = time_role_split[0]
                        role = time_role_split[1]  # 'OIC'
                    else:
                        shift_time = shift_info
                        role = ''  # No role for rows other than OIC

                    # Check if shift time is a range (start-end)
                    if "-" in shift_time:
                        shift_start_time, shift_end_time = shift_time.split("-")
                    else:
                        print(f"Unexpected format in shift hours: {shift_time}")
                        continue

                    # Traverse each day column to get officer names
                    for i, day in enumerate(days):
                        if pd.isna(day):
                            continue
                        
                        officer_name = df.iat[shift_row, col + 1 + i]
                        if pd.isna(officer_name) or officer_name == '----------':
                            continue
                        
                        # Store extracted data
                        overnight_patrol_data.append({
                            'shift_name': 'Overnight Patrol',
                            'day': day,
                            'shift_start_time': shift_start_time.strip(),
                            'shift_end_time': shift_end_time.strip(),
                            'role': role.strip(),
                            'officer_name': officer_name.strip()
                        })
                    
                    # After processing the first row, set role to blank for remaining officers
                    role = ''
                
                return overnight_patrol_data
    return []

# Example of using this function in your main code
def main():
    # Load the Google Sheet with shift data
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("Permanent Shifts")
    
    # Extract Overnight Patrol shifts data
    overnight_patrol_data = extract_overnight_patrol_shifts(sheet)
    if overnight_patrol_data:
        print("Extracted Overnight Patrol Data:")
        for shift in overnight_patrol_data:
            print(shift)
        
        # Insert data into the database
        insert_shift_data(overnight_patrol_data)
    else:
        print("No Overnight Patrol data found.")

if __name__ == "__main__":
    main()


# Main function to execute the extraction and insertion process
def main():
    sheet = gc.open_by_key(os.getenv("GOOGLE_SHEET_ID")).worksheet("Permanent Shifts")
    
    # Extract and insert Knight Mover data
    knight_mover_data = extract_knight_mover_shifts(sheet)
    if knight_mover_data:
        print("Extracted Knight Mover Data:")
        for shift in knight_mover_data:
            print(shift)
        insert_shift_data(knight_mover_data)
    else:
        print("No Knight Mover data found.")

    # Extract and insert CA Foot Patrol data
    ca_foot_patrol_data = extract_ca_foot_patrol_shifts(sheet)
    if ca_foot_patrol_data:
        print("Extracted CA Foot Patrol Data:")
        for shift in ca_foot_patrol_data:
            print(shift)
        insert_shift_data(ca_foot_patrol_data)
    else:
        print("No CA Foot Patrol data found.")

    # Extract and insert Mounted Patrol data
    mounted_patrol_data = extract_mounted_patrol_shifts(sheet)
    if mounted_patrol_data:
        print("Extracted Mounted Patrol Data:")
        for shift in mounted_patrol_data:
            print(shift)
        insert_shift_data(mounted_patrol_data)
    else:
        print("No Mounted Patrol data found.")

    # Extract PSB Lobby data
    psb_lobby_data = extract_psb_lobby_shifts(sheet)
    if psb_lobby_data:
        print("Extracted PSB Lobby Data:")
        for shift in psb_lobby_data:
            print(shift)
        
        # Insert data into the database
        insert_shift_data(psb_lobby_data)
    else:
        print("No PSB Lobby data found.")

    # Extract Civic Square data
    civic_square_data = extract_civic_square_shifts(sheet)
    if civic_square_data:
        print("Extracted Civic Square Data:")
        for shift in civic_square_data:
            print(shift)
        
        # Insert data into the database
        insert_shift_data(civic_square_data)
    else:
        print("No Civic Square data found.")
    
    # Extract Sec. Tech. data
    sec_tech_data = extract_sec_tech_shifts(sheet)
    if sec_tech_data:
        print("Extracted Sec. Tech. Data:")
        for shift in sec_tech_data:
            print(shift)
        
        # Insert data into the database
        insert_shift_data(sec_tech_data)
    else:
        print("No Sec. Tech. data found.")

    # Extract RBS Back Entrance data
    rbs_back_entrance_data = extract_rbs_back_entrance_shifts(sheet)
    if rbs_back_entrance_data:
        print("Extracted RBS Back Entrance Data:")
        for shift in rbs_back_entrance_data:
            print(shift)
        insert_shift_data(rbs_back_entrance_data)

    # Extract RBS Front Entrance data
    rbs_front_entrance_data = extract_rbs_front_entrance_shifts(sheet)
    if rbs_front_entrance_data:
        print("Extracted RBS Front Entrance Data:")
        for shift in rbs_front_entrance_data:
            print(shift)
        insert_shift_data(rbs_front_entrance_data)

    # Extract Supervisor Hours data
    supervisor_hours_data = extract_supervisor_hours_shifts(sheet)
    if supervisor_hours_data:
        print("Extracted Supervisor Hours Data:")
        for shift in supervisor_hours_data:
            print(shift)
        insert_shift_data(supervisor_hours_data)
    
    # Extract Overnight Patrol data
    overnight_patrol_data = extract_overnight_patrol_shifts(sheet)
    if overnight_patrol_data:
        print("Extracted Overnight Patrol Data:")
        for shift in overnight_patrol_data:
            print(shift)
        insert_shift_data(overnight_patrol_data)

if __name__ == "__main__":
    main()
