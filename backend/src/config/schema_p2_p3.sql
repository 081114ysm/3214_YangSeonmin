USE devfocus;

-- 1. users에 role 컬럼 추가 (없을 때만)
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='users' AND COLUMN_NAME='role') > 0,
  'SELECT 1',
  "ALTER TABLE users ADD COLUMN role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student'"
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 2. courses에 instructor_id 추가 (없을 때만)
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND COLUMN_NAME='instructor_id') > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD COLUMN instructor_id INT DEFAULT NULL'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 3. instructor_id 외래키 (없을 때만)
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND CONSTRAINT_NAME='fk_course_instructor') > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL'
));
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

-- 4. payments 테이블
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  amount INT NOT NULL DEFAULT 29900,
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  payment_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 5. notifications 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  status ENUM('sent','failed') DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. job_logs 테이블
CREATE TABLE IF NOT EXISTS job_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  status ENUM('running','completed','failed') NOT NULL,
  message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL
);

-- 7. 인덱스 (information_schema로 중복 방지)
SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='progress' AND INDEX_NAME='idx_progress_user')>0,'SELECT 1','CREATE INDEX idx_progress_user ON progress(user_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='progress' AND INDEX_NAME='idx_progress_lesson')>0,'SELECT 1','CREATE INDEX idx_progress_lesson ON progress(lesson_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='focus_sessions' AND INDEX_NAME='idx_focus_user')>0,'SELECT 1','CREATE INDEX idx_focus_user ON focus_sessions(user_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='focus_sessions' AND INDEX_NAME='idx_focus_created')>0,'SELECT 1','CREATE INDEX idx_focus_created ON focus_sessions(created_at)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='questions' AND INDEX_NAME='idx_questions_user')>0,'SELECT 1','CREATE INDEX idx_questions_user ON questions(user_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='course_likes' AND INDEX_NAME='idx_course_likes_c')>0,'SELECT 1','CREATE INDEX idx_course_likes_c ON course_likes(course_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='enrollments' AND INDEX_NAME='idx_enrollments_user')>0,'SELECT 1','CREATE INDEX idx_enrollments_user ON enrollments(user_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='code_snippets' AND INDEX_NAME='idx_snippets_user')>0,'SELECT 1','CREATE INDEX idx_snippets_user ON code_snippets(user_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='payments' AND INDEX_NAME='idx_payments_user')>0,'SELECT 1','CREATE INDEX idx_payments_user ON payments(user_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;

SET @s = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='devfocus' AND TABLE_NAME='courses' AND INDEX_NAME='idx_courses_instr')>0,'SELECT 1','CREATE INDEX idx_courses_instr ON courses(instructor_id)');
PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
