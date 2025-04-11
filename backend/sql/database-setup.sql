-- Drop the database if it exists
DROP DATABASE IF EXISTS shift_scheduler;

-- Create the database and set it as the current database
CREATE DATABASE shift_scheduler;
USE shift_scheduler;

-- Create the "users" table (for login/registration)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create the unified "shifts" table.
-- This table stores all shift data (e.g., PSB Lobby, Knight Mover, etc.)
CREATE TABLE IF NOT EXISTS shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    role VARCHAR(50),
    officer_name VARCHAR(100),
    status ENUM('open','requested','assigned') DEFAULT 'open',
    sheet_name VARCHAR(100),
    sheet_row INT,
    sheet_col INT,
    UNIQUE (shift_type, date, start_time, end_time, role)
);

-- Create the "coverage_requests" table.
-- This table tracks coverage requests for each shift.
CREATE TABLE IF NOT EXISTS coverage_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_id INT NOT NULL,
    requester_officer VARCHAR(100) NOT NULL,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    queue_position INT DEFAULT 0,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
);


-- Done!
-- You now have:
--   1) The "users" table for user accounts.
--   2) The "shifts" table for all shift data.
--   3) The "coverage_requests" table for managing coverage.
