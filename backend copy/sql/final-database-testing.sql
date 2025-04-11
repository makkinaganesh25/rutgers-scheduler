-- Drop the database if it exists
DROP DATABASE IF EXISTS shift_scheduler;

-- Create the database and use it
CREATE DATABASE shift_scheduler;
USE shift_scheduler;

-- Create officers table to store officer information
CREATE TABLE officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  -- Officer name must be unique
    contact_info VARCHAR(100) DEFAULT 'N/A'  -- Additional contact info, default to 'N/A'
);

-- Table for KNIGHT MOVER shift
CREATE TABLE knight_mover_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    dispatcher_driver_1 VARCHAR(100),  -- Officer in the first dispatcher/driver slot
    dispatcher_driver_2 VARCHAR(100),  -- Officer in the second dispatcher/driver slot
    dispatcher_driver_3 VARCHAR(100),  -- Officer in the third dispatcher/driver slot
    FOREIGN KEY (dispatcher_driver_1) REFERENCES officers(name),
    FOREIGN KEY (dispatcher_driver_2) REFERENCES officers(name),
    FOREIGN KEY (dispatcher_driver_3) REFERENCES officers(name)
);


-- Table for CA FOOT PATROL shift
CREATE TABLE ca_foot_patrol_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer_1 VARCHAR(100),
    officer_2 VARCHAR(100),
    FOREIGN KEY (officer_1) REFERENCES officers(name),
    FOREIGN KEY (officer_2) REFERENCES officers(name)
);

-- Table for MOUNTED PATROL shift
CREATE TABLE mounted_patrol_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    oic VARCHAR(100),       -- Officer in Charge
    rider VARCHAR(100),     -- Rider
    FOREIGN KEY (oic) REFERENCES officers(name),
    FOREIGN KEY (rider) REFERENCES officers(name)
);

-- Table for OVERNIGHT PATROL shift
CREATE TABLE overnight_patrol_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    oic VARCHAR(100),       -- Officer in Charge
    officer_1 VARCHAR(100),
    officer_2 VARCHAR(100),
    officer_3 VARCHAR(100),
    officer_4 VARCHAR(100),
    officer_5 VARCHAR(100),
    officer_6 VARCHAR(100),
    FOREIGN KEY (oic) REFERENCES officers(name),
    FOREIGN KEY (officer_1) REFERENCES officers(name),
    FOREIGN KEY (officer_2) REFERENCES officers(name),
    FOREIGN KEY (officer_3) REFERENCES officers(name),
    FOREIGN KEY (officer_4) REFERENCES officers(name),
    FOREIGN KEY (officer_5) REFERENCES officers(name),
    FOREIGN KEY (officer_6) REFERENCES officers(name)
);

-- Table for PSB LOBBY shift
CREATE TABLE psb_lobby_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer_morning VARCHAR(100),   -- Morning shift officer
    officer_afternoon VARCHAR(100), -- Afternoon shift officer
    FOREIGN KEY (officer_morning) REFERENCES officers(name),
    FOREIGN KEY (officer_afternoon) REFERENCES officers(name)
);

-- Table for Civic Square shift
CREATE TABLE civic_square_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer VARCHAR(100),
    FOREIGN KEY (officer) REFERENCES officers(name)
);

-- Table for Sec. Tech. shift
CREATE TABLE sec_tech_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer VARCHAR(100),
    FOREIGN KEY (officer) REFERENCES officers(name)
);

-- Table for RBS Back Entrance shift
CREATE TABLE rbs_back_entrance_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer VARCHAR(100),
    FOREIGN KEY (officer) REFERENCES officers(name)
);

-- Table for RBS Front Entrance shift
CREATE TABLE rbs_front_entrance_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer VARCHAR(100),
    FOREIGN KEY (officer) REFERENCES officers(name)
);

-- Table for Supervisor Hours shift
CREATE TABLE supervisor_hours_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer VARCHAR(100),
    FOREIGN KEY (officer) REFERENCES officers(name)
);
-----------------------------------------------------------------------------
-- -- Coverage Requests Table
-- CREATE TABLE coverage_requests (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     shift_type VARCHAR(100) NOT NULL,  -- e.g., "KNIGHT MOVER", "CA FOOT PATROL"
--     shift_id INT NOT NULL,  -- Link to the specific shift ID
--     requesting_officer_id INT NOT NULL,  -- Officer requesting coverage
--     status ENUM('pending', 'assigned', 'rejected') DEFAULT 'pending',  -- Status of the request
--     requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the request was made
--     FOREIGN KEY (requesting_officer_id) REFERENCES officers(id) ON DELETE CASCADE
-- );

CREATE TABLE shift_coverage_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL,                         -- Reference to the specific shift
    requester_officer VARCHAR(100) NOT NULL,       -- Officer requesting coverage
    status ENUM('open', 'filled', 'canceled') DEFAULT 'open',  -- Status of the coverage request
    request_date DATE NOT NULL,                    -- Date of the requested shift coverage
    reason TEXT,                                   -- Optional reason for requesting coverage
    request_type ENUM('individual', 'continuous') DEFAULT 'individual', -- Type of request
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date request was made
    FOREIGN KEY (shift_id) REFERENCES shift_template(id) ON DELETE CASCADE
);


-- Shift Queue Table for managing shift coverage requests
CREATE TABLE shift_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL,  -- The shift for which coverage is requested
    officer_id INT NOT NULL,  -- Officer in the queue for the shift
    queue_position INT NOT NULL,  -- Queue position to handle conflicts
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the request was made
    FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
);

CREATE TABLE continuous_shift_releases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    officer_name VARCHAR(100) NOT NULL,            -- Officer requesting continuous release
    start_date DATE NOT NULL,                      -- Start date of the continuous coverage
    end_date DATE,                                 -- End date if specified, else open-ended
    reason TEXT,                                   -- Optional reason for release
    status ENUM('open', 'filled', 'canceled') DEFAULT 'open',  -- Status of the coverage request
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Date request was made
    FOREIGN KEY (officer_name) REFERENCES officers(name) ON DELETE CASCADE
);

-- Shift Audit Log Table for tracking changes
CREATE TABLE shift_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,  -- Action type like "coverage request", "assignment", etc.
    shift_type VARCHAR(100) NOT NULL,  -- e.g., "KNIGHT MOVER", "CA FOOT PATROL"
    shift_id INT NOT NULL,  -- Shift affected by the action
    officer_id INT,  -- Officer involved in the action
    description TEXT,  -- Description of the change
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the action occurred
    FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
);

--new column being added since his campus column is not present in the table
ALTER TABLE mounted_patrol_shifts ADD COLUMN campus VARCHAR(10) DEFAULT 'C/D';

CREATE TABLE sec_tech_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer VARCHAR(100),
    FOREIGN KEY (officer) REFERENCES officers(name)
);
---------------------------------------------------------------------------
--Shift Template Table for permanent shift
CREATE TABLE shift_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_name VARCHAR(100) NOT NULL,              -- Name of the shift (e.g., "KNIGHT MOVER", "CA FOOT PATROL")
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    role VARCHAR(50),                              -- Role in the shift (e.g., "Dispatcher", "Rider", etc.)
    officer_name VARCHAR(100),                     -- Name of the officer assigned to the role
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp to track when this template row was added
);

CREATE TABLE shift_template_change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_template_id INT NOT NULL,
    action ENUM('insert', 'update', 'delete') NOT NULL,  -- Type of action taken
    changed_by VARCHAR(100),                             -- Name of the user/admin who made the change
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Date and time of change
    old_officer_name VARCHAR(100),                       -- Old officer (for reference in updates)
    new_officer_name VARCHAR(100),                       -- New officer (for reference in updates)
    FOREIGN KEY (shift_template_id) REFERENCES shift_template(id) ON DELETE CASCADE
);


CREATE TRIGGER after_shift_template_update
AFTER UPDATE ON shift_template
FOR EACH ROW
BEGIN
    INSERT INTO shift_template_change_log (shift_template_id, action, old_officer_name, new_officer_name, changed_by)
    VALUES (OLD.id, 'update', OLD.officer_name, NEW.officer_name, 'SYSTEM');
END;


-----------------------------------------
