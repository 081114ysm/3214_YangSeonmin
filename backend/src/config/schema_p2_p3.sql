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
