DROP DATABASE IF EXISTS shift_scheduler;
CREATE DATABASE shift_scheduler;
USE shift_scheduler;

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  user_rank  VARCHAR(10)    NULL,
  first_name VARCHAR(100)   NULL,
  phone      VARCHAR(25)    NULL,
  email      VARCHAR(255)   NULL
);

-- 2) Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  shift_type    VARCHAR(100) NOT NULL,
  date          DATE         NOT NULL,
  start_time    TIME         NOT NULL,
  end_time      TIME         NOT NULL,
  role          VARCHAR(50),
  officer_name  VARCHAR(100),
  status        ENUM('open','requested','assigned') DEFAULT 'open',
  sheet_name    VARCHAR(100),
  sheet_row     INT,
  sheet_col     INT,
  UNIQUE (shift_type, date, start_time, end_time, role)
);

-- 3) Coverage requests table (enhanced)
CREATE TABLE IF NOT EXISTS coverage_requests (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  shift_id           INT            NOT NULL,
  requester_officer  VARCHAR(100)   NOT NULL,
  accepting_officer  VARCHAR(100)   NULL,
  shift_type         VARCHAR(100)   NOT NULL,
  shift_date         DATE           NOT NULL,
  shift_start        TIME           NOT NULL,
  shift_end          TIME           NOT NULL,
  status             ENUM('pending','accepted','rejected') DEFAULT 'pending',
  requested_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  queue_position     INT            DEFAULT 0,
  FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
);
