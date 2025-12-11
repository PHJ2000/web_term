CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(255) NOT NULL,
  professor   VARCHAR(255),
  day_of_week TINYINT,
  start_time  TIME,
  end_time    TIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  course_id   INT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  due_date    DATE,
  status      VARCHAR(20) DEFAULT 'pending',
  priority    TINYINT DEFAULT 2,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
