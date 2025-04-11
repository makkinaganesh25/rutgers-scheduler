INSERT INTO shift_postings (position_type, shift_time, day) VALUES
('Patrol', '0800-1200', 'Monday'),
('Desk Job', '1200-1600', 'Monday'),
('Mounted Patrol', '1600-2000', 'Tuesday');


INSERT INTO officers (name, contact_info) VALUES
('Alice Johnson', 'alice.johnson@example.com'),
('Bob Smith', 'bob.smith@example.com'),
('Charlie Brown', 'charlie.brown@example.com');


INSERT INTO daily_assignments (shift_posting_id, date, assigned_officer_id, status) VALUES
(1, '2024-11-06', 1, 'assigned'),
(2, '2024-11-06', 2, 'assigned'),
(3, '2024-11-07', 3, 'assigned');


INSERT INTO coverage_requests (daily_assignment_id, requesting_officer_id, status) VALUES
(1, 1, 'pending'),
(2, 2, 'pending');


SELECT * FROM shift_postings;


SELECT * FROM officers
order by name desc;


SELECT * FROM knight_mover_shifts;

mounted_patrol_shifts;
SELECT * FROM overnight_patrol_shifts;

select * from ca_foot_patrol_shifts;

SELECT * FROM civic_square_shifts;

select * from rbs_back_entrance_shifts;

select * from sec_tech_shifts;


SELECT * FROM coverage_requests;

select * from shift_types;

SELECT * FROM coverage_requests WHERE status = 'pending';

TRUNCATE TABLE overnight_patrol_shifts;


-- Step 1: Delete records from shift_template_change_log
DELETE FROM shift_template_change_log;

-- Step 2: Truncate shift_template
TRUNCATE TABLE shift_template;

delete from shift_template;

select * from shift_template;
select * FROM shift_template_change_log;


SELECT officer_name, COUNT(*)
FROM shift_template
GROUP BY officer_name
HAVING COUNT(*) >= 1
order by officer_name;


INSERT INTO officers (name, contact_info) VALUES
('Officer A', 'emailA@example.com'),
('Officer B', 'emailB@example.com'),
('Officer C', 'emailC@example.com');


INSERT INTO shift_template (shift_name, day, start_time, end_time, role, officer_name)
VALUES
('KNIGHT MOVER', 'Monday', '08:00', '12:00', 'Dispatcher', 'Officer A'),
('CA FOOT PATROL', 'Monday', '12:00', '16:00', 'Patrol Officer', 'Officer B');


INSERT INTO shift_coverage_requests (shift_id, requester_officer, status, request_date, reason, request_type)
VALUES
(1, 'Officer A', 'open', CURDATE(), 'Medical Leave', 'individual');


SELECT * FROM shift_template WHERE id = 1;

INSERT INTO shift_template (shift_name, day, start_time, end_time, role, officer_name)
VALUES ('KNIGHT MOVER', 'Monday', '08:00', '12:00', 'Dispatcher', 'Officer A');


SELECT * FROM shift_template WHERE shift_name = 'KNIGHT MOVER' AND day = 'Monday';

INSERT INTO shift_coverage_requests (shift_id, requester_officer, status, request_date, reason, request_type)
VALUES (1343, 'Officer B', 'open', CURDATE(), 'Medical Leave', 'individual');


SELECT * FROM shift_coverage_requests WHERE shift_id = 1343;


SELECT * FROM shift_template
WHERE officer_name = 'Officer C'
AND day = 'Monday'
AND ((start_time <= '08:00:00' AND end_time >= '12:00:00') OR
    (start_time >= '08:00:00' AND start_time <= '12:00:00'));



--------------------------testing--------------------------
INSERT INTO officers (name, contact_info) VALUES
('Officer 1', 'contact_A'),
('Officer 2', 'contact_B'),
('Officer 3', 'contact_C'),
('Officer 4', 'contact_D');

INSERT INTO shift_template (shift_name, day, start_time, end_time, role, officer_name, date_added) VALUES
('KNIGHT MOVER', 'Monday', '08:00:00', '12:00:00', 'Dispatcher', 'Officer 1', '2024-11-07 08:00:00'),
('CA FOOT PATROL', 'Monday', '08:00:00', '12:00:00', 'Patroller', 'Officer 2', '2024-11-07 08:00:00'),
('KNIGHT MOVER', 'Monday', '12:00:00', '16:00:00', 'Dispatcher', 'Officer 3', '2024-11-07 08:00:00');

INSERT INTO shift_coverage_requests (shift_id, requester_officer, status, request_date, reason)
VALUES (1346, 'Officer 1', 'open', '2024-11-08', 'Unable to work shift');



INSERT INTO shift_template (shift_name, day, start_time, end_time, role, officer_name, date_added)
VALUES ('RBS Entrance', 'Monday', '09:00:00', '13:00:00', 'Security', 'Officer 4', '2024-11-07 08:00:00');


SELECT * FROM shift_template
WHERE officer_name = 'Officer 4'
AND day = 'Monday'
AND ((start_time <= '08:00:00' AND end_time >= '12:00:00') OR
     (start_time >= '08:00:00' AND start_time < '12:00:00'));
