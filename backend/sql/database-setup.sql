-- DROP DATABASE IF EXISTS shift_scheduler;
-- CREATE DATABASE shift_scheduler;
-- USE shift_scheduler;

-- CREATE TABLE IF NOT EXISTS users (
--   id         INT AUTO_INCREMENT PRIMARY KEY,
--   username   VARCHAR(50)  NOT NULL UNIQUE,
--   password   VARCHAR(255) NOT NULL,
--   user_rank  VARCHAR(10)    NULL,
--   first_name VARCHAR(100)   NULL,
--   phone      VARCHAR(25)    NULL,
--   email      VARCHAR(255)   NULL,
--   COLUMN manager_id INT NULL,
--   FOREIGN KEY (manager_id) REFERENCES users(id)

-- );

-- -- 1) events table
-- CREATE TABLE IF NOT EXISTS events (
--   id          INT AUTO_INCREMENT PRIMARY KEY,
--   name        VARCHAR(255)  NOT NULL,
--   date        DATE          NOT NULL,
--   description TEXT,
--   capacity    INT           NOT NULL,
--   created_by  INT           NOT NULL,
--   created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 2) event_slots table
-- CREATE TABLE IF NOT EXISTS event_slots (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   event_id     INT  NOT NULL,
--   assignment   VARCHAR(100) NOT NULL,
--   time_in      VARCHAR(10),
--   time_out     VARCHAR(10),
--   filled_by    INT  NULL,
--   filled_at    TIMESTAMP NULL,
--   FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
-- );

-- -- 2) Shifts table
-- CREATE TABLE IF NOT EXISTS shifts (
--   id            INT AUTO_INCREMENT PRIMARY KEY,
--   shift_type    VARCHAR(100) NOT NULL,
--   date          DATE         NOT NULL,
--   start_time    TIME         NOT NULL,
--   end_time      TIME         NOT NULL,
--   role          VARCHAR(50),
--   officer_name  VARCHAR(100),
--   status        ENUM('open','requested','assigned') DEFAULT 'open',
--   sheet_name    VARCHAR(100),
--   sheet_row     INT,
--   sheet_col     INT,
--   UNIQUE (shift_type, date, start_time, end_time, role)
-- );

-- -- 3) Coverage requests table (enhanced)
-- CREATE TABLE IF NOT EXISTS coverage_requests (
--   id                 INT AUTO_INCREMENT PRIMARY KEY,
--   shift_id           INT            NOT NULL,
--   requester_officer  VARCHAR(100)   NOT NULL,
--   accepting_officer  VARCHAR(100)   NULL,
--   shift_type         VARCHAR(100)   NOT NULL,
--   shift_date         DATE           NOT NULL,
--   shift_start        TIME           NOT NULL,
--   shift_end          TIME           NOT NULL,
--   status             ENUM('pending','accepted','rejected') DEFAULT 'pending',
--   requested_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
--   queue_position     INT            DEFAULT 0,
--   FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
-- );

//-----------------------------------------------------------------------------------------------------------------------------------------
-- -- DROP + CREATE database
-- DROP DATABASE IF EXISTS shift_scheduler;
-- CREATE DATABASE shift_scheduler;
-- USE shift_scheduler;

-- -- 1) users table (we’ll restore its data from backup if needed)
-- CREATE TABLE IF NOT EXISTS users (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   username     VARCHAR(50)   NOT NULL UNIQUE,
--   password     VARCHAR(255)  NOT NULL,
--   user_rank    VARCHAR(10)   NULL,
--   first_name   VARCHAR(100)  NULL,
--   phone        VARCHAR(25)   NULL,
--   email        VARCHAR(255)  NULL,
--   manager_id   INT           NULL,
--   status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
--   FOREIGN KEY (manager_id) REFERENCES users(id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -- 2) events table
-- CREATE TABLE IF NOT EXISTS events (
--   id          INT AUTO_INCREMENT PRIMARY KEY,
--   name        VARCHAR(255) NOT NULL,
--   date        DATE         NOT NULL,
--   description TEXT,
--   capacity    INT          NOT NULL,
--   created_by  INT          NOT NULL,
--   created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 3) event_slots table
-- CREATE TABLE IF NOT EXISTS event_slots (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   event_id     INT          NOT NULL,
--   assignment   VARCHAR(100) NOT NULL,
--   time_in      VARCHAR(10),
--   time_out     VARCHAR(10),
--   filled_by    INT          NULL,
--   filled_at    TIMESTAMP    NULL,
--   FOREIGN KEY (event_id)
--     REFERENCES events(id)
--     ON DELETE CASCADE
-- );

-- -- 4) shifts table, with slot_id foreign key
-- CREATE TABLE IF NOT EXISTS shifts (
--   id            INT AUTO_INCREMENT PRIMARY KEY,
--   slot_id       INT          NULL,
--   shift_type    VARCHAR(100) NOT NULL,
--   date          DATE         NOT NULL,
--   start_time    TIME         NOT NULL,
--   end_time      TIME         NOT NULL,
--   role          VARCHAR(50),
--   officer_name  VARCHAR(100),
--   status        ENUM('open','requested','assigned') DEFAULT 'open',
--   sheet_name    VARCHAR(100),
--   sheet_row     INT,
--   sheet_col     INT,
--   UNIQUE (shift_type, date, start_time, end_time, role),
--   FOREIGN KEY (slot_id)
--     REFERENCES event_slots(id)
--     ON DELETE CASCADE
-- );

-- -- 5) coverage_requests table
-- CREATE TABLE IF NOT EXISTS coverage_requests (
--   id                  INT AUTO_INCREMENT PRIMARY KEY,
--   shift_id            INT            NOT NULL,
--   requester_officer   VARCHAR(100)   NOT NULL,
--   accepting_officer   VARCHAR(100)   NULL,
--   shift_type          VARCHAR(100)   NOT NULL,
--   shift_date          DATE           NOT NULL,
--   shift_start         TIME           NOT NULL,
--   shift_end           TIME           NOT NULL,
--   status              ENUM('pending','accepted','rejected') DEFAULT 'pending',
--   requested_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
--   queue_position      INT            DEFAULT 0,
--   FOREIGN KEY (shift_id)
--     REFERENCES shifts(id)
--     ON DELETE CASCADE
-- );

-- CREATE TABLE swap_requests (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   requester_officer VARCHAR(255) NOT NULL,
--   requester_shift_id INT NOT NULL,
--   target_officer    VARCHAR(255) NOT NULL,
--   target_shift_id   INT NOT NULL,
--   status ENUM('pending','accepted','declined','cancelled')
--          NOT NULL DEFAULT 'pending',
--   requested_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   responded_at DATETIME   NULL,
--   INDEX(requester_officer),
--   INDEX(target_officer),
--   FOREIGN KEY (requester_shift_id) REFERENCES shifts(id),
--   FOREIGN KEY (target_shift_id)    REFERENCES shifts(id)
-- );

-- CREATE TABLE IF NOT EXISTS cso_leave_requests (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   user_id      INT        NOT NULL,          
--   start_date   DATE       NOT NULL,
--   end_date     DATE       NOT NULL,
--   status       ENUM('pending','approved','denied')
--                  NOT NULL DEFAULT 'pending',
--   requested_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- CREATE TABLE IF NOT EXISTS cso_leave_logs (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   request_id   INT        NOT NULL,         
--   acted_by     INT        NOT NULL,         
--   action       ENUM('approved','denied') NOT NULL,
--   acted_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (request_id) REFERENCES cso_leave_requests(id),
--   FOREIGN KEY (acted_by)   REFERENCES users(id)
-- );


-- -- 1a) Audit table for CSO mandates
-- CREATE TABLE IF NOT EXISTS cso_mandate_assignments (
--   id                INT AUTO_INCREMENT PRIMARY KEY,
--   shift_id          INT NOT NULL,
--   mandated_by       INT NOT NULL,   
--   mandated_officer  INT NOT NULL,    
--   reason            VARCHAR(255) NULL,
--   mandated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (shift_id)         REFERENCES shifts(id),
--   FOREIGN KEY (mandated_by)      REFERENCES users(id),
--   FOREIGN KEY (mandated_officer) REFERENCES users(id)
-- );

-- -- Security Officers tables
-- -- 1a) Clone your 'users' schema for security officers
-- CREATE TABLE IF NOT EXISTS security_officers (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   username     VARCHAR(50)   NOT NULL UNIQUE,
--   password     VARCHAR(255)  NOT NULL,
--   user_rank    VARCHAR(10)   NULL,
--   first_name   VARCHAR(100)  NULL,
--   phone        VARCHAR(25)   NULL,
--   email        VARCHAR(255)  NULL,
--   manager_id   INT           NULL,
--   status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
--   FOREIGN KEY (manager_id) REFERENCES security_officers(id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -- 1b) Leave requests for Security Officers
-- CREATE TABLE IF NOT EXISTS security_leave_requests (
--   id           INT AUTO_INCREMENT PRIMARY KEY,
--   officer_id   INT NOT NULL,
--   start_date   DATE NOT NULL,
--   end_date     DATE NOT NULL,
--   status       ENUM('pending','approved','denied') NOT NULL DEFAULT 'pending',
--   requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (officer_id) REFERENCES security_officers(id)
-- );

-- -- 1c) Audit log of mandated assignments for Security Officers
-- CREATE TABLE IF NOT EXISTS security_mandate_assignments (
--   id               INT AUTO_INCREMENT PRIMARY KEY,
--   shift_id         INT NOT NULL,
--   mandated_by      INT NOT NULL,     -- lieutenant’s ID in security_officers
--   mandated_officer INT NOT NULL,     -- the forced-assignee ID
--   mandated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   reason           VARCHAR(255) NULL,
--   FOREIGN KEY (shift_id)         REFERENCES shifts(id),
--   FOREIGN KEY (mandated_by)      REFERENCES security_officers(id),
--   FOREIGN KEY (mandated_officer) REFERENCES security_officers(id)
-- );

-- -- 8) announcements table
-- CREATE TABLE IF NOT EXISTS announcements (
--   id            INT AUTO_INCREMENT PRIMARY KEY,
--   title         VARCHAR(255) NOT NULL,
--   body          TEXT,
--   created_by    INT          NOT NULL,
--   created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (created_by) REFERENCES users(id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -- 9) announcement_files table
-- CREATE TABLE IF NOT EXISTS announcement_files (
--   id               INT AUTO_INCREMENT PRIMARY KEY,
--   announcement_id  INT           NOT NULL,
--   filename         VARCHAR(255)  NOT NULL,
--   gcs_path         VARCHAR(500)  NOT NULL,
--   uploaded_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (announcement_id)
--     REFERENCES announcements(id)
--     ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -- 8) starred_announcements: one row per (user, announcement)
-- CREATE TABLE IF NOT EXISTS starred_announcements (
--   user_id         INT       NOT NULL,
--   announcement_id INT       NOT NULL,
--   starred_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (user_id, announcement_id),
--   FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
--   FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
-- );

-- ALTER TABLE announcements
--   ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL;

-- CREATE TABLE IF NOT EXISTS announcement_files (
--   id              INT AUTO_INCREMENT PRIMARY KEY,
--   announcement_id INT          NOT NULL,
--   filename        VARCHAR(255) NOT NULL,
--   gcs_path        VARCHAR(512) NOT NULL,
--   uploaded_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (announcement_id)
--     REFERENCES announcements(id)
--     ON DELETE CASCADE
-- );

-- CREATE TABLE IF NOT EXISTS starred_announcements (
--   user_id         INT NOT NULL,
--   announcement_id INT NOT NULL,
--   starred_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (user_id, announcement_id),
--   FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
--   FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
-- );

//------------------------------------------------------------------------------------------------------------------------------------------
-- --------------------------------------------------------------------------------
-- SCHEMA DUMP: shift_scheduler + announcements + all related tables
-- --------------------------------------------------------------------------------

DROP DATABASE IF EXISTS shift_scheduler;
CREATE DATABASE shift_scheduler CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shift_scheduler;

-- -----------------------------------------------------------------------------
-- 1) users
-- -----------------------------------------------------------------------------
CREATE TABLE departments (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)   NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  user_rank   VARCHAR(10),
  first_name  VARCHAR(100),
  phone       VARCHAR(25),
  email       VARCHAR(255),
  manager_id  INT,
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  FOREIGN KEY (manager_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2) events & slots
-- -----------------------------------------------------------------------------
CREATE TABLE events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  date        DATE         NOT NULL,
  description TEXT,
  capacity    INT          NOT NULL,
  created_by  INT          NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE event_slots (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  event_id     INT NOT NULL,
  assignment   VARCHAR(100) NOT NULL,
  time_in      VARCHAR(10),
  time_out     VARCHAR(10),
  filled_by    INT,
  filled_at    TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (filled_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3) shifts + coverage + swaps
-- -----------------------------------------------------------------------------
CREATE TABLE shifts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slot_id       INT,
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
  UNIQUE (shift_type, date, start_time, end_time, role),
  FOREIGN KEY (slot_id) REFERENCES event_slots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE coverage_requests (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  shift_id           INT NOT NULL,
  requester_officer  VARCHAR(100) NOT NULL,
  accepting_officer  VARCHAR(100),
  shift_type         VARCHAR(100) NOT NULL,
  shift_date         DATE           NOT NULL,
  shift_start        TIME           NOT NULL,
  shift_end          TIME           NOT NULL,
  status             ENUM('pending','accepted','rejected') DEFAULT 'pending',
  requested_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  queue_position     INT DEFAULT 0,
  FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE swap_requests (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  requester_officer   VARCHAR(255) NOT NULL,
  requester_shift_id  INT NOT NULL,
  target_officer      VARCHAR(255) NOT NULL,
  target_shift_id     INT NOT NULL,
  status              ENUM('pending','accepted','declined','cancelled') DEFAULT 'pending',
  requested_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at        DATETIME,
  FOREIGN KEY (requester_shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
  FOREIGN KEY (target_shift_id)    REFERENCES shifts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4) CSO leave & logs
-- -----------------------------------------------------------------------------
CREATE TABLE cso_leave_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       ENUM('pending','approved','denied') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cso_leave_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  acted_by   INT NOT NULL,
  action     ENUM('approved','denied') NOT NULL,
  acted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES cso_leave_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (acted_by)   REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5) CSO mandate assignments
-- -----------------------------------------------------------------------------
CREATE TABLE cso_mandate_assignments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  shift_id         INT NOT NULL,
  mandated_by      INT NOT NULL,
  mandated_officer INT NOT NULL,
  reason           VARCHAR(255),
  mandated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id)         REFERENCES shifts(id) ON DELETE CASCADE,
  FOREIGN KEY (mandated_by)      REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mandated_officer) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6) Security officers & leave & mandates
-- -----------------------------------------------------------------------------
CREATE TABLE security_officers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  user_rank   VARCHAR(10),
  first_name  VARCHAR(100),
  phone       VARCHAR(25),
  email       VARCHAR(255),
  manager_id  INT,
  status      ENUM('active','inactive') DEFAULT 'active',
  FOREIGN KEY (manager_id) REFERENCES security_officers(id)
) ENGINE=InnoDB;

CREATE TABLE security_leave_requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  officer_id   INT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       ENUM('pending','approved','denied') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (officer_id) REFERENCES security_officers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE security_mandate_assignments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  shift_id         INT NOT NULL,
  mandated_by      INT NOT NULL,
  mandated_officer INT NOT NULL,
  reason           VARCHAR(255),
  mandated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id)         REFERENCES shifts(id) ON DELETE CASCADE,
  FOREIGN KEY (mandated_by)      REFERENCES security_officers(id) ON DELETE CASCADE,
  FOREIGN KEY (mandated_officer) REFERENCES security_officers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 7) Announcements + attachments + stars
-- -----------------------------------------------------------------------------
CREATE TABLE announcements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  created_by  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE announcement_files (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  announcement_id  INT NOT NULL,
  filename         VARCHAR(255) NOT NULL,
  gcs_path         VARCHAR(512) NOT NULL,
  uploaded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcement_id)
    REFERENCES announcements(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE announcement_stars (
  user_id         INT NOT NULL,
  announcement_id INT NOT NULL,
  starred_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, announcement_id),
  FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
) ENGINE=InnoDB;
