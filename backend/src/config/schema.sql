CREATE DATABASE IF NOT EXISTS devfocus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE devfocus;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(500),
  `order` INT DEFAULT 0,
  duration INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  watched_seconds INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_progress (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 샘플 강의 데이터
INSERT IGNORE INTO courses (id, title, description, thumbnail) VALUES
(1, 'React 기초부터 실전까지', 'React의 기본 개념부터 프로젝트 실습까지 배워봅니다.', '/images/react.png'),
(2, 'Node.js 백엔드 개발', 'Express를 활용한 REST API 서버 구축을 학습합니다.', '/images/node.png'),
(3, 'TypeScript 완전 정복', '타입스크립트의 핵심 개념과 실무 활용법을 익힙니다.', '/images/ts.png');

INSERT IGNORE INTO lessons (id, course_id, title, video_url, `order`, duration) VALUES
(1, 1, 'React란 무엇인가?', 'https://example.com/react-1', 1, 600),
(2, 1, 'JSX 문법 이해하기', 'https://example.com/react-2', 2, 720),
(3, 1, 'useState와 useEffect', 'https://example.com/react-3', 3, 900),
(4, 2, 'Node.js 소개', 'https://example.com/node-1', 1, 480),
(5, 2, 'Express 시작하기', 'https://example.com/node-2', 2, 660),
(6, 2, 'REST API 설계', 'https://example.com/node-3', 3, 840),
(7, 3, 'TypeScript 기본 타입', 'https://example.com/ts-1', 1, 540),
(8, 3, '인터페이스와 타입', 'https://example.com/ts-2', 2, 720),
(9, 3, '제네릭 활용', 'https://example.com/ts-3', 3, 780);
