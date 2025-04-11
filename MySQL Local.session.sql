USE shift_scheduler;
SHOW TABLES;

INSERT INTO users (username, password) VALUES ('testuser', '$2b$10$b.5nq7jdQjtdt1m79SOZHebM9iX41QgCKwgEhvbkdI5wqhHQ0nAxC');


SELECT * FROM users WHERE username = 'testuser';

{
  "id": 1,
  "username": "testuser",
  "password": "$2b$10$b.5nq7jdQjtdt1m79SOZHebM9iX41QgCKwgEhvbkdI5wqhHQ0nAxC"
}