-- Drop the database if it exists
DROP DATABASE IF EXISTS shift_scheduler;

-- Create the database and use it
CREATE DATABASE shift_scheduler;
USE shift_scheduler;

-- Create users table to store user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);


-- Create officers table to store officer information
CREATE TABLE officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,        -- Officer name must be unique
    contact_info VARCHAR(100) DEFAULT 'N/A'   -- Additional contact info, default to 'N/A'
);

-- Table for Knight Mover shift
CREATE TABLE knight_mover_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    dispatcher_driver_1 VARCHAR(100),
    dispatcher_driver_2 VARCHAR(100),
    dispatcher_driver_3 VARCHAR(100),
    FOREIGN KEY (dispatcher_driver_1) REFERENCES officers(name),
    FOREIGN KEY (dispatcher_driver_2) REFERENCES officers(name),
    FOREIGN KEY (dispatcher_driver_3) REFERENCES officers(name)
);

-- Table for CA Foot Patrol shift
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

-- Table for Mounted Patrol shift
CREATE TABLE mounted_patrol_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    oic VARCHAR(100),
    rider VARCHAR(100),
    campus VARCHAR(10) DEFAULT 'C/D',
    FOREIGN KEY (oic) REFERENCES officers(name),
    FOREIGN KEY (rider) REFERENCES officers(name)
);

-- Table for Overnight Patrol shift
CREATE TABLE overnight_patrol_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    oic VARCHAR(100),
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

-- Table for PSB Lobby shift
CREATE TABLE psb_lobby_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    officer_morning VARCHAR(100),
    officer_afternoon VARCHAR(100),
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

-- Table for Security Tech shift
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

-- Shift Template for permanent shifts
CREATE TABLE shift_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_name VARCHAR(100) NOT NULL,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    role VARCHAR(50),
    officer_name VARCHAR(100),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coverage Requests Table
CREATE TABLE shift_coverage_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL,
    requester_officer VARCHAR(100) NOT NULL,
    status ENUM('open', 'filled', 'canceled') DEFAULT 'open',
    request_date DATE NOT NULL,
    reason TEXT,
    request_type ENUM('individual', 'continuous') DEFAULT 'individual',
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shift_template(id) ON DELETE CASCADE
);

-- Shift Queue Table for managing shift coverage requests
CREATE TABLE shift_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL,
    officer_id INT NOT NULL,
    queue_position INT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
);

-- Continuous Shift Releases Table
CREATE TABLE continuous_shift_releases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    officer_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status ENUM('open', 'filled', 'canceled') DEFAULT 'open',
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_name) REFERENCES officers(name) ON DELETE CASCADE
);

-- Shift Audit Log Table
CREATE TABLE shift_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    shift_type VARCHAR(100) NOT NULL,
    shift_id INT NOT NULL,
    officer_id INT,
    description TEXT,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES officers(id) ON DELETE CASCADE
);

-- Shift Template Change Log Table
CREATE TABLE shift_template_change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_template_id INT NOT NULL,
    action ENUM('insert', 'update', 'delete') NOT NULL,
    changed_by VARCHAR(100),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_officer_name VARCHAR(100),
    new_officer_name VARCHAR(100),
    FOREIGN KEY (shift_template_id) REFERENCES shift_template(id) ON DELETE CASCADE
);



-- Trigger to log changes in shift_template
DELIMITER //
CREATE TRIGGER after_shift_template_update
AFTER UPDATE ON shift_template
FOR EACH ROW
BEGIN
    INSERT INTO shift_template_change_log (shift_template_id, action, old_officer_name, new_officer_name, changed_by)
    VALUES (OLD.id, 'update', OLD.officer_name, NEW.officer_name, 'SYSTEM');
END;
//
DELIMITER ;
