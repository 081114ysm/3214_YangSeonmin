# ERD 명세서 — DevFocus (전체: P1 + P2 + P3)

## 1. 개요

| 항목 | 내용 |
|------|------|
| DB | MySQL 8.0 |
| 문자셋 | utf8mb4 / utf8mb4_unicode_ci |
| 날짜 형식 | TIMESTAMP (CURRENT_TIMESTAMP 기본값) |
| FK 정책 | 대부분 ON DELETE CASCADE, 예외는 명시 |

---

## 2. ER 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                           users                                  │
├─────────────────────────────────────────────────────────────────┤
│ PK  id           INT AUTO_INCREMENT                             │
│     email        VARCHAR(255) NOT NULL UNIQUE                   │
│     password     VARCHAR(255) NOT NULL                          │
│     nickname     VARCHAR(100) NOT NULL                          │
│     role         ENUM('student','instructor','admin')           │  ← P2
│                  NOT NULL DEFAULT 'student'                     │
│     created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP           │
└──────────┬──────────────────────────────────────────────────────┘
           │
           │ 1:N (instructor_id)                  ← P2
           ▼
┌──────────────────────┐      ┌──────────────────────┐
│       courses        │      │       lessons         │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │◄─────│ FK  course_id         │
│     title            │  1:N │ PK  id               │
│     description      │      │     title            │
│     thumbnail        │      │     video_url        │
│     category         │      │     `order`          │
│ FK  instructor_id    │      │     duration         │
│     created_at       │      │     created_at       │
└──────┬───────────────┘      └───────┬──────────────┘
       │                              │
       │ 1:N                          │ 1:N
       ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│     enrollments      │      │       progress        │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  user_id          │
│ FK  course_id        │      │ FK  lesson_id        │
│     enrolled_at      │      │     watched_seconds  │
│ UNIQUE(user_id,      │      │     updated_at       │
│        course_id)    │      │ UNIQUE(user_id,      │
└──────────────────────┘      │        lesson_id)    │
                              └──────────────────────┘
       │ (users → course_likes)
       ▼
┌──────────────────────┐      ┌──────────────────────┐
│    course_likes      │      │   course_comments     │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  user_id          │
│ FK  course_id        │      │ FK  course_id        │
│     created_at       │      │     content          │
│ UNIQUE(user_id,      │      │     created_at       │
│        course_id)    │      └──────────────────────┘
└──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│     focus_sessions   │      │    code_snippets      │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id          │      │ FK  user_id          │
│     start_time       │      │     title            │
│     end_time         │      │     code             │
│     duration         │      │     language         │
│     created_at       │      │     memo             │
└──────────────────────┘      │     created_at       │
                              └──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│      questions       │      │       answers         │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │◄─────│ FK  question_id       │
│ FK  user_id          │  1:N │ PK  id               │
│     title            │      │ FK  user_id          │
│     content          │      │     content          │
│     created_at       │      │     created_at       │
└──────────────────────┘      └──────────────────────┘

──────────────── P2/P3 신규 테이블 ────────────────

┌──────────────────────┐
│      payments        │   ← P2
├──────────────────────┤
│ PK  id               │
│ FK  user_id          │
│ FK  course_id        │
│     amount           │
│     status           │
│     payment_key      │
│     created_at       │
└──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│    notifications     │      │      job_logs         │
├──────────────────────┤      ├──────────────────────┤
│ PK  id               │      │ PK  id               │
│ FK  user_id (null OK)│      │     job_name         │
│     type             │      │     status           │
│     title            │      │     message          │
│     message          │      │     started_at       │
│     status           │      │     finished_at      │
│     sent_at          │      └──────────────────────┘
└──────────────────────┘
```

---

## 3. 테이블 상세 명세

### 3.1 users (사용자)

**P1 기본 + P2에서 `role` 컬럼 추가**

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 사용자 고유 ID |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| `nickname` | VARCHAR(100) | NOT NULL | 닉네임 |
| `role` | ENUM | NOT NULL, DEFAULT `'student'` | `student` \| `instructor` \| `admin` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 가입일시 |

**인덱스**: `email` (UNIQUE 인덱스)

**관계**:
- → `questions` (1:N)
- → `answers` (1:N)
- → `focus_sessions` (1:N)
- → `progress` (1:N)
- → `course_likes` (1:N)
- → `course_comments` (1:N)
- → `enrollments` (1:N)
- → `code_snippets` (1:N)
- → `courses.instructor_id` (1:N, P2)
- → `payments` (1:N, P2)
- → `notifications` (1:N, nullable, P3)

---

### 3.2 courses (강의)

**P1 기본 + P2에서 `instructor_id` 컬럼 추가**

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 강의 고유 ID |
| `title` | VARCHAR(255) | NOT NULL | 강의 제목 |
| `description` | TEXT | nullable | 강의 설명 |
| `thumbnail` | VARCHAR(500) | nullable | 썸네일 URL |
| `category` | VARCHAR(100) | DEFAULT `'전체'` | 강의 카테고리 |
| `instructor_id` | INT | FK → users(id), nullable | 강사 ID (P2 추가) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 등록일시 |

**인덱스**:
- `idx_courses_instr` — `instructor_id` (P3 추가, 강사별 조회 최적화)

**FK 정책**: `instructor_id` ON DELETE SET NULL (강사 계정 삭제 시 강의는 남기고 instructor_id만 NULL로)

**관계**:
- → `lessons` (1:N)
- → `enrollments` (1:N)
- → `course_likes` (1:N)
- → `course_comments` (1:N)
- → `payments` (1:N, P2)

---

### 3.3 lessons (강의 영상)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 레슨 고유 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 소속 강의 ID |
| `title` | VARCHAR(255) | NOT NULL | 레슨 제목 |
| `video_url` | VARCHAR(500) | nullable | 영상 URL |
| `` `order` `` | INT | DEFAULT 0 | 정렬 순서 (강의 내 순번) |
| `duration` | INT | DEFAULT 0 | 영상 길이(초) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 등록일시 |

**FK 정책**: ON DELETE CASCADE (강의 삭제 시 레슨 자동 삭제)

**관계**: → `progress` (1:N)

---

### 3.4 progress (학습 진도)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 진도 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `lesson_id` | INT | FK → lessons(id), NOT NULL | 레슨 ID |
| `watched_seconds` | INT | DEFAULT 0 | 시청 시간(초) |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 마지막 수정일시 |

**UNIQUE KEY**: `(user_id, lesson_id)` — 사용자별 레슨당 1개 진도 기록 (UPSERT 보장)

**인덱스** (P3 추가):
- `idx_progress_user` — `user_id`
- `idx_progress_lesson` — `lesson_id`

**FK 정책**: ON DELETE CASCADE (사용자/레슨 삭제 시 진도 자동 삭제)

---

### 3.5 focus_sessions (집중 타이머 세션)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 세션 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `start_time` | DATETIME | NOT NULL | 집중 시작 시간 |
| `end_time` | DATETIME | nullable | 집중 종료 시간 (진행 중이면 NULL) |
| `duration` | INT | nullable | 집중 시간(초) (종료 후 계산) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

**인덱스** (P3 추가):
- `idx_focus_user` — `user_id`
- `idx_focus_created` — `created_at` (스케줄러: 90일 이상 된 세션 정리에 사용)

**FK 정책**: ON DELETE CASCADE

---

### 3.6 questions (Q&A 질문)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 질문 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `title` | VARCHAR(255) | NOT NULL | 질문 제목 (2자 이상) |
| `content` | TEXT | nullable | 질문 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

**인덱스** (P3 추가):
- `idx_questions_user` — `user_id`

**FK 정책**: ON DELETE CASCADE

**관계**: → `answers` (1:N)

---

### 3.7 answers (Q&A 답변)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 답변 고유 ID |
| `question_id` | INT | FK → questions(id), NOT NULL | 질문 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `content` | TEXT | NOT NULL | 답변 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

**FK 정책**: ON DELETE CASCADE

---

### 3.8 course_likes (강의 좋아요)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 강의 ID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 좋아요 누른 시각 |

**UNIQUE KEY**: `(user_id, course_id)` — 사용자당 강의별 1개 좋아요

**인덱스** (P3 추가):
- `idx_course_likes_c` — `course_id`

**FK 정책**: ON DELETE CASCADE

---

### 3.9 course_comments (강의 댓글)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 강의 ID |
| `content` | TEXT | NOT NULL | 댓글 내용 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

**FK 정책**: ON DELETE CASCADE

---

### 3.10 enrollments (수강 신청)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 사용자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 강의 ID |
| `enrolled_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 수강 신청 일시 |

**UNIQUE KEY**: `(user_id, course_id)` — 중복 수강 신청 방지

**인덱스** (P3 추가):
- `idx_enrollments_user` — `user_id`

**FK 정책**: ON DELETE CASCADE

---

### 3.11 code_snippets (코드 스니펫)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 작성자 ID |
| `title` | VARCHAR(255) | NOT NULL | 스니펫 제목 |
| `code` | TEXT | NOT NULL | 코드 내용 |
| `language` | VARCHAR(50) | NOT NULL, DEFAULT `'javascript'` | 프로그래밍 언어 |
| `memo` | TEXT | nullable | 메모 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 저장일시 |

**인덱스** (P3 추가):
- `idx_snippets_user` — `user_id`

**FK 정책**: ON DELETE CASCADE

---

### 3.12 payments (결제) — P2 신규

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 결제 고유 ID |
| `user_id` | INT | FK → users(id), NOT NULL | 결제 사용자 ID |
| `course_id` | INT | FK → courses(id), NOT NULL | 결제 강의 ID |
| `amount` | INT | NOT NULL, DEFAULT 29900 | 결제 금액(원) |
| `status` | ENUM | DEFAULT `'pending'` | `pending` \| `completed` \| `failed` \| `refunded` |
| `payment_key` | VARCHAR(255) | nullable | 결제 키 (Mock 발급) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 결제 요청 일시 |

**인덱스** (P3 추가):
- `idx_payments_user` — `user_id`

**FK 정책**: ON DELETE CASCADE

**상태 전이**:
```
pending → completed (결제 확인)
pending → failed    (결제 실패 또는 30분 초과 시 스케줄러가 자동 처리)
completed → refunded (환불)
```

---

### 3.13 notifications (알림 로그) — P3 신규

이메일·Discord 알림 발송 이력을 저장한다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `user_id` | INT | FK → users(id), nullable | 수신 사용자 ID (시스템 알림은 NULL) |
| `type` | VARCHAR(50) | NOT NULL | 알림 유형 (예: `welcome`, `enrollment_complete`, `daily_stats`) |
| `title` | VARCHAR(255) | NOT NULL | 알림 제목 |
| `message` | TEXT | nullable | 알림 내용 |
| `status` | ENUM | DEFAULT `'sent'` | `sent` \| `failed` |
| `sent_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 발송 시각 |

**FK 정책**: ON DELETE SET NULL (사용자 삭제 시 로그는 보존, user_id만 NULL)

**type 목록**:
| type | 설명 |
|------|------|
| `welcome` | 회원가입 환영 이메일 |
| `enrollment_complete` | 수강 신청 완료 이메일 |
| `daily_stats` | 매일 09:00 Discord 일별 통계 |
| `error_alert` | 에러 발생 시 Discord 즉시 알림 |

---

### 3.14 job_logs (스케줄러 실행 로그) — P3 신규

node-cron 스케줄러 작업의 실행 이력을 저장한다.

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|---------|------|
| `id` | INT | PK, AUTO_INCREMENT | 고유 ID |
| `job_name` | VARCHAR(100) | NOT NULL | 작업 이름 (예: `daily_stats`, `cleanup_focus`, `expire_payments`) |
| `status` | ENUM | NOT NULL | `running` \| `completed` \| `failed` |
| `message` | TEXT | nullable | 실행 결과 메시지 또는 에러 내용 |
| `started_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작업 시작 시각 |
| `finished_at` | TIMESTAMP | nullable | 작업 완료 시각 |

**job_name 목록**:
| job_name | 스케줄 | 설명 |
|----------|--------|------|
| `daily_stats` | 매일 09:00 | Discord에 일별 통계 전송 |
| `cleanup_focus` | 매주 월요일 03:00 | 90일 이상 된 집중 세션 삭제 |
| `expire_payments` | 매시간 | pending 결제 30분 초과 시 failed 처리 |

---

## 4. 전체 관계 요약

| 관계 | 카디널리티 | 설명 |
|------|-----------|------|
| users → courses (instructor_id) | 1:N | 강사가 여러 강의 생성 (P2) |
| users → questions | 1:N | 사용자가 여러 질문 작성 |
| users → answers | 1:N | 사용자가 여러 답변 작성 |
| users → focus_sessions | 1:N | 사용자가 여러 집중 세션 |
| users → progress | 1:N | 사용자가 여러 레슨 진도 보유 |
| users → course_likes | 1:N | 사용자가 여러 강의 좋아요 |
| users → course_comments | 1:N | 사용자가 여러 강의 댓글 |
| users → enrollments | 1:N | 사용자가 여러 강의 수강 신청 |
| users → code_snippets | 1:N | 사용자가 여러 코드 스니펫 저장 |
| users → payments | 1:N | 사용자가 여러 결제 내역 보유 (P2) |
| users → notifications | 1:N | 사용자에게 여러 알림 발송 (P3) |
| courses → lessons | 1:N | 강의에 여러 레슨 포함 |
| courses → enrollments | 1:N | 강의에 여러 수강 신청 |
| courses → course_likes | 1:N | 강의에 여러 좋아요 |
| courses → course_comments | 1:N | 강의에 여러 댓글 |
| courses → payments | 1:N | 강의에 여러 결제 내역 (P2) |
| lessons → progress | 1:N | 레슨당 여러 진도 기록 |
| questions → answers | 1:N | 질문에 여러 답변 |

**복합 UNIQUE KEY 목록**:
| 테이블 | 키 | 목적 |
|--------|-----|------|
| `progress` | `(user_id, lesson_id)` | 사용자별 레슨당 1개 진도 (UPSERT) |
| `course_likes` | `(user_id, course_id)` | 사용자당 강의별 1번 좋아요 |
| `enrollments` | `(user_id, course_id)` | 중복 수강 신청 방지 |

---

## 5. 인덱스 전체 목록

### P1 기본 인덱스 (UNIQUE KEY)

| 테이블 | 인덱스 | 컬럼 | 유형 |
|--------|--------|------|------|
| users | — | email | UNIQUE |
| progress | unique_progress | (user_id, lesson_id) | UNIQUE |
| course_likes | unique_like | (user_id, course_id) | UNIQUE |
| enrollments | unique_enrollment | (user_id, course_id) | UNIQUE |

### P3 추가 성능 인덱스

| 인덱스명 | 테이블 | 컬럼 | 목적 |
|----------|--------|------|------|
| `idx_progress_user` | progress | user_id | 사용자별 진도 조회 |
| `idx_progress_lesson` | progress | lesson_id | 레슨별 진도 조회 |
| `idx_focus_user` | focus_sessions | user_id | 사용자별 집중 기록 조회 |
| `idx_focus_created` | focus_sessions | created_at | 90일 이상 세션 정리 스케줄러 |
| `idx_questions_user` | questions | user_id | 사용자별 질문 조회 |
| `idx_course_likes_c` | course_likes | course_id | 강의별 좋아요 수 집계 |
| `idx_enrollments_user` | enrollments | user_id | 사용자별 수강 목록 |
| `idx_snippets_user` | code_snippets | user_id | 사용자별 스니펫 조회 |
| `idx_payments_user` | payments | user_id | 사용자별 결제 내역 조회 |
| `idx_courses_instr` | courses | instructor_id | 강사별 강의 목록 조회 |

---

## 6. 마이그레이션 순서

### 6.1 초기 설치 (P1)

```bash
mysql -u root -p devfocus < backend/src/config/schema.sql
```

생성 테이블: `users`, `courses`, `lessons`, `progress`, `focus_sessions`, `questions`, `answers`, `course_likes`, `course_comments`, `enrollments`, `code_snippets`

### 6.2 P2/P3 마이그레이션 (기존 DB)

```bash
mysql -u root -p devfocus < backend/src/config/schema_p2_p3.sql
```

변경 내용:
1. `users.role` 컬럼 추가 (기존 행은 `'student'`로 설정)
2. `courses.instructor_id` 컬럼 + FK 추가
3. `payments` 테이블 생성
4. `notifications` 테이블 생성
5. `job_logs` 테이블 생성
6. 성능 인덱스 10개 추가

### 6.3 관리자 계정 설정

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 7. 설계 원칙

### 삭제 정책

| 상황 | 정책 | 이유 |
|------|------|------|
| 사용자 삭제 | CASCADE → 질문, 답변, 진도, 집중 기록, 스니펫, 결제 내역 삭제 | 개인 데이터이므로 함께 삭제 |
| 강사 삭제 | `courses.instructor_id` → SET NULL | 강의는 콘텐츠 자산이므로 보존 |
| 강의 삭제 | CASCADE → 레슨, 수강 신청, 좋아요, 댓글, 결제 내역 삭제 | 강의가 없어지면 연관 데이터 불필요 |
| 레슨 삭제 | CASCADE → 진도 기록 삭제 | 레슨이 없으면 진도 의미 없음 |
| 사용자 삭제 | `notifications.user_id` → SET NULL | 알림 로그는 감사 목적으로 보존 |

### 날짜/시간 저장

- 모든 날짜는 `TIMESTAMP` 또는 `DATETIME` 사용 (MySQL 서버 시간 기준)
- `created_at`: `DEFAULT CURRENT_TIMESTAMP`
- `updated_at`: `ON UPDATE CURRENT_TIMESTAMP` (progress 테이블)
- `end_time`, `finished_at`: 완료 전까지 `NULL` 허용

### ENUM 활용

| 테이블 | 컬럼 | ENUM 값 |
|--------|------|---------|
| users | role | `student`, `instructor`, `admin` |
| payments | status | `pending`, `completed`, `failed`, `refunded` |
| notifications | status | `sent`, `failed` |
| job_logs | status | `running`, `completed`, `failed` |
