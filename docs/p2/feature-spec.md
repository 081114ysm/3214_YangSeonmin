# P2 기능명세서 — DevFocus 인증/권한 시스템

## 1. 개요

| 항목 | 내용 |
|------|------|
| 단계 | P2 — 인증 및 역할 기반 접근 제어 |
| 기반 | P1 (기본 서비스: 강의, 진도, 집중 타이머, Q&A, 코드 스니펫) |
| 목적 | JWT 인증을 도입하고 student / instructor / admin 세 역할로 기능 접근을 제어한다 |
| 기술 스택 | Express 5, MySQL 8, JWT (HS256), bcrypt, express-rate-limit, helmet |

---

## 2. 역할(Role) 정의

### 2.1 역할 계층 구조

```
admin
 └─ instructor (admin 권한 포함)
      └─ student (instructor 권한 중 일반 기능 포함)
```

### 2.2 역할별 권한 매트릭스

| 기능 영역 | student | instructor | admin |
|-----------|:-------:|:----------:|:-----:|
| 강의 열람 | O | O | O |
| 수강 신청 | O | O | O |
| 강의 좋아요 / 댓글 | O | O | O |
| 집중 타이머 이용 | O | O | O |
| Q&A 질문/답변 | O | O | O |
| 코드 스니펫 이용 | O | O | O |
| 결제 기능 이용 | O | O | O |
| **강의 생성** | X | O (본인) | O |
| **강의 수정/삭제** | X | O (본인) | O |
| **레슨 추가/수정/삭제** | X | O (본인 강의) | O |
| **강사 대시보드** | X | O | O |
| **전체 사용자 목록** | X | X | O |
| **역할 변경** | X | X | O |
| **사용자 강제 삭제** | X | X | O |
| **모든 강의 강제 삭제** | X | X | O |
| **전체 통계 조회** | X | X | O |

---

## 3. 인증 방식

### 3.1 JWT 토큰 구조

**Header**
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload**
```json
{
  "id": 1,
  "role": "student",
  "iat": 1710000000,
  "exp": 1710604800
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | 사용자 고유 ID |
| `role` | string | `student` \| `instructor` \| `admin` |
| `iat` | number | 발급 시각 (Unix timestamp) |
| `exp` | number | 만료 시각 (발급 후 7일) |

### 3.2 요청 헤더

```
Authorization: Bearer {token}
```

### 3.3 토큰 보안 정책

| 항목 | 값 |
|------|-----|
| 알고리즘 | HS256 |
| 만료 시간 | 7일 |
| Secret 저장 | 환경변수 `JWT_SECRET` (하드코딩 금지) |
| Refresh Token | MVP 이후 고려 (현재 미지원, 만료 시 재로그인) |

---

## 4. 기능 명세

### 4.1 회원가입 (AUTH-P2-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | AUTH-P2-01 |
| 엔드포인트 | `POST /api/auth/register` |
| 인증 필요 | X |
| 설명 | 이메일, 비밀번호, 닉네임, 역할을 입력받아 신규 사용자를 등록한다 |

**입력 필드**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `email` | string | O | 이메일 형식, UNIQUE |
| `password` | string | O | 4자 이상 |
| `nickname` | string | O | 2자 이상 |
| `role` | string | X | `student` \| `instructor` (기본값: `student`) |

**처리 흐름**
1. 입력값 유효성 검사 (이메일 형식, 비밀번호 길이, 닉네임 길이)
2. 이메일 중복 여부 확인 → 중복 시 409 반환
3. bcrypt (saltRounds=10)로 비밀번호 해시
4. `users` 테이블에 저장 (role 컬럼 포함)
5. JWT 발급 후 반환

**응답 예시 (201 Created)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "student"
  }
}
```

---

### 4.2 로그인 (AUTH-P2-02)

| 항목 | 내용 |
|------|------|
| 기능 ID | AUTH-P2-02 |
| 엔드포인트 | `POST /api/auth/login` |
| 인증 필요 | X |
| 설명 | 이메일/비밀번호 검증 후 JWT 토큰과 역할 정보를 반환한다 |

**입력 필드**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `email` | string | O | 가입 이메일 |
| `password` | string | O | 비밀번호 |

**처리 흐름**
1. 이메일로 사용자 조회 → 없으면 401 반환
2. bcrypt.compare로 비밀번호 검증 → 불일치 시 401 반환
3. Payload `{ id, role }`로 JWT 서명
4. 토큰 + 사용자 정보(role 포함) 반환

**응답 예시 (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "instructor"
  }
}
```

---

### 4.3 관리자 기능 (ADMIN-*)

#### 4.3.1 전체 통계 조회 (ADMIN-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-01 |
| 엔드포인트 | `GET /api/admin/stats` |
| 필요 역할 | `admin` |
| 설명 | 전체 사용자 수, 강의 수, 수강 신청 수, 집중 시간 합계 등 통계를 반환한다 |

**응답 예시 (200 OK)**
```json
{
  "totalUsers": 152,
  "totalCourses": 12,
  "totalEnrollments": 430,
  "totalFocusSeconds": 1728000,
  "usersByRole": {
    "student": 148,
    "instructor": 3,
    "admin": 1
  }
}
```

---

#### 4.3.2 전체 사용자 목록 조회 (ADMIN-02)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-02 |
| 엔드포인트 | `GET /api/admin/users` |
| 필요 역할 | `admin` |
| 설명 | 전체 사용자 목록을 페이지네이션 없이 반환한다 |

**응답 예시 (200 OK)**
```json
{
  "users": [
    { "id": 1, "email": "user1@example.com", "nickname": "홍길동", "role": "student", "created_at": "2026-01-01T00:00:00.000Z" },
    { "id": 2, "email": "inst@example.com", "nickname": "김강사", "role": "instructor", "created_at": "2026-01-02T00:00:00.000Z" }
  ]
}
```

---

#### 4.3.3 사용자 역할 변경 (ADMIN-03)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-03 |
| 엔드포인트 | `PATCH /api/admin/users/:id/role` |
| 필요 역할 | `admin` |
| 설명 | 특정 사용자의 역할을 변경한다 |

**요청 바디**
```json
{ "role": "instructor" }
```

**유효성 검사**
- `role` 값이 `student`, `instructor`, `admin` 중 하나여야 한다
- 존재하지 않는 사용자 ID → 404 반환

**응답 예시 (200 OK)**
```json
{ "message": "역할이 변경되었습니다.", "user": { "id": 2, "role": "instructor" } }
```

---

#### 4.3.4 사용자 강제 삭제 (ADMIN-04)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-04 |
| 엔드포인트 | `DELETE /api/admin/users/:id` |
| 필요 역할 | `admin` |
| 설명 | 특정 사용자를 강제 삭제한다. CASCADE로 연결 데이터도 삭제된다 |

**응답 예시 (200 OK)**
```json
{ "message": "사용자가 삭제되었습니다." }
```

---

#### 4.3.5 전체 강의 목록 조회 (ADMIN-05)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-05 |
| 엔드포인트 | `GET /api/admin/courses` |
| 필요 역할 | `admin` |
| 설명 | 강사 정보를 포함한 전체 강의 목록을 반환한다 |

**응답 예시 (200 OK)**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "React 기초부터 실전까지",
      "instructor": { "id": 2, "nickname": "김강사" },
      "enrollmentCount": 45,
      "created_at": "2026-01-05T00:00:00.000Z"
    }
  ]
}
```

---

#### 4.3.6 강의 강제 삭제 (ADMIN-06)

| 항목 | 내용 |
|------|------|
| 기능 ID | ADMIN-06 |
| 엔드포인트 | `DELETE /api/admin/courses/:id` |
| 필요 역할 | `admin` |
| 설명 | 특정 강의를 강제 삭제한다. 레슨·수강신청·진도 등 연결 데이터도 CASCADE 삭제된다 |

**응답 예시 (200 OK)**
```json
{ "message": "강의가 삭제되었습니다." }
```

---

### 4.4 강사 기능 (INSTRUCTOR-*)

#### 4.4.1 내 강의 목록 조회 (INSTR-01)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-01 |
| 엔드포인트 | `GET /api/instructor/courses` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 로그인한 강사 본인이 생성한 강의 목록을 반환한다 |

**응답 예시 (200 OK)**
```json
{
  "courses": [
    {
      "id": 3,
      "title": "TypeScript 완전 정복",
      "lessonCount": 9,
      "enrollmentCount": 22,
      "created_at": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 4.4.2 강의 생성 (INSTR-02)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-02 |
| 엔드포인트 | `POST /api/instructor/courses` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 새 강의를 생성한다. `instructor_id`에 요청자 ID가 자동 설정된다 |

**요청 바디**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `title` | string | O | 강의 제목 |
| `description` | string | X | 강의 설명 |
| `thumbnail` | string | X | 썸네일 URL |
| `category` | string | X | 카테고리 (기본값: '전체') |

**응답 예시 (201 Created)**
```json
{
  "course": {
    "id": 4,
    "title": "Next.js 실전 프로젝트",
    "instructor_id": 2,
    "created_at": "2026-04-22T00:00:00.000Z"
  }
}
```

---

#### 4.4.3 강의 수정 (INSTR-03)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-03 |
| 엔드포인트 | `PATCH /api/instructor/courses/:id` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 본인이 생성한 강의만 수정 가능. 타인 강의 수정 시 403 반환 |

**소유권 검증**: `courses.instructor_id === req.user.id` 확인

**응답 예시 (200 OK)**
```json
{ "message": "강의가 수정되었습니다.", "course": { "id": 4, "title": "Next.js 실전 (개정판)" } }
```

---

#### 4.4.4 강의 삭제 (INSTR-04)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-04 |
| 엔드포인트 | `DELETE /api/instructor/courses/:id` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 본인이 생성한 강의만 삭제 가능. CASCADE로 레슨·수강신청·진도 삭제 |

---

#### 4.4.5 레슨 추가 (INSTR-05)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-05 |
| 엔드포인트 | `POST /api/instructor/courses/:id/lessons` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 본인 강의에 새 레슨을 추가한다 |

**요청 바디**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `title` | string | O | 레슨 제목 |
| `video_url` | string | X | 영상 URL |
| `order` | number | X | 정렬 순서 (기본값: 0) |
| `duration` | number | X | 영상 길이(초) (기본값: 0) |

**응답 예시 (201 Created)**
```json
{
  "lesson": {
    "id": 10,
    "course_id": 4,
    "title": "프로젝트 셋업",
    "order": 1,
    "duration": 600
  }
}
```

---

#### 4.4.6 레슨 수정 (INSTR-06)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-06 |
| 엔드포인트 | `PATCH /api/instructor/courses/:id/lessons/:lessonId` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 본인 강의의 특정 레슨을 수정한다 |

---

#### 4.4.7 레슨 삭제 (INSTR-07)

| 항목 | 내용 |
|------|------|
| 기능 ID | INSTR-07 |
| 엔드포인트 | `DELETE /api/instructor/courses/:id/lessons/:lessonId` |
| 필요 역할 | `instructor` \| `admin` |
| 설명 | 본인 강의의 특정 레슨을 삭제한다. 연결된 progress 데이터 CASCADE 삭제 |

---

## 5. 미들웨어 명세

### 5.1 requireAuth (인증 검사)

```
요청 헤더에서 Authorization: Bearer {token} 추출
  → 토큰 없음: 401 { "error": "토큰 없음" }
  → jwt.verify 실패 (만료/위변조): 401 { "error": "토큰 오류" }
  → 검증 성공: req.user = { id, role } 주입 후 next()
```

### 5.2 requireRole(role) (역할 검사)

```
requireAuth 통과 이후 실행
  → req.user.role이 필요 역할을 충족하지 않으면: 403 { "error": "권한 없음" }
  → 충족하면: next()
```

**역할 충족 조건**: admin > instructor > student 계층. `admin`은 모든 역할 통과, `instructor`는 `student` 역할도 통과.

### 5.3 checkCourseOwnership (강의 소유권 검사)

```
courses.instructor_id === req.user.id 확인
  → 불일치 + req.user.role !== 'admin': 403 { "error": "권한 없음" }
  → 일치 또는 admin: next()
```

### 5.4 미들웨어 파이프라인

```
Request
  └─ cors()
  └─ helmet()              ← 보안 헤더 (P2)
  └─ rateLimit()           ← Rate Limiting (P2)
  └─ express.json()
  └─ requireAuth           ← JWT 검증
  └─ requireRole(...)      ← 역할 검증
  └─ checkCourseOwnership  ← 소유권 검증 (instructor 전용)
  └─ Controller
  └─ errorHandler
```

---

## 6. 보안 요구사항

### 6.1 OWASP Top 10 대응

| 항목 | 위협 | 대응 방안 |
|------|------|-----------|
| A01 | Broken Access Control | `requireRole` 미들웨어, `instructor_id` 소유권 검증 |
| A02 | Cryptographic Failures | `JWT_SECRET` 환경변수 분리, bcrypt saltRounds=10 |
| A03 | Injection | mysql2 prepared statement (`?` 파라미터), 입력값 `trim()` |
| A05 | Security Misconfiguration | Helmet 보안 헤더, CORS origin 제한 |
| A07 | Auth Failures | Rate Limiting (인증 API: 15분/20회), 토큰 만료 7일 |

### 6.2 Rate Limiting 정책

| 대상 | 제한 |
|------|------|
| 인증 API (`/api/auth/*`) | 15분간 최대 20회 |
| 전체 API | 15분간 최대 200회 |

### 6.3 Helmet 적용 헤더

| 헤더 | 목적 |
|------|------|
| `X-Content-Type-Options: nosniff` | MIME 스니핑 방어 |
| `X-Frame-Options: DENY` | Clickjacking 방어 |
| `X-XSS-Protection: 1; mode=block` | XSS 방어 |
| `Strict-Transport-Security` | HTTPS 강제 |

---

## 7. 에러 응답 코드

| HTTP 코드 | 에러 메시지 | 발생 상황 |
|-----------|------------|----------|
| 400 | `"입력값이 올바르지 않습니다"` | 유효성 검사 실패 |
| 401 | `"토큰 없음"` | Authorization 헤더 누락 |
| 401 | `"토큰 오류"` | JWT 만료 또는 위변조 |
| 401 | `"이메일 또는 비밀번호가 올바르지 않습니다"` | 로그인 자격증명 불일치 |
| 403 | `"권한 없음"` | 역할 부족 또는 소유권 없음 |
| 404 | `"사용자를 찾을 수 없습니다"` | 존재하지 않는 사용자 ID |
| 404 | `"강의를 찾을 수 없습니다"` | 존재하지 않는 강의 ID |
| 409 | `"이미 존재하는 이메일입니다"` | 이메일 중복 |
| 500 | `"서버 오류가 발생했습니다"` | 내부 서버 오류 |

---

## 8. DB 변경 사항 (P1 → P2)

### 8.1 `users` 테이블 컬럼 추가

```sql
ALTER TABLE users
  ADD COLUMN role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student';
```

### 8.2 `courses` 테이블 컬럼 추가

```sql
ALTER TABLE courses
  ADD COLUMN instructor_id INT DEFAULT NULL,
  ADD CONSTRAINT fk_course_instructor
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL;
```

### 8.3 신규 테이블

- `payments` — 결제 내역 (P2/P3 공용)
- `notifications` — 이메일/알림 발송 로그 (P3)
- `job_logs` — 스케줄러 실행 로그 (P3)

---

## 9. 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `JWT_SECRET` | JWT 서명 비밀키 (필수) | `super-secret-key-change-in-prod` |
| `PORT` | 서버 포트 | `3001` |
| `NODE_ENV` | 실행 환경 | `development` \| `production` |
| `DB_HOST` | DB 호스트 | `localhost` |
| `DB_PORT` | DB 포트 | `3306` |
| `DB_USER` | DB 사용자 | `root` |
| `DB_PASSWORD` | DB 비밀번호 | — |
| `DB_NAME` | DB 이름 | `devfocus` |

---

## 10. 관리자 계정 초기 설정

P2 배포 후 최초 관리자 계정 설정 방법:

```sql
-- 회원가입 후 admin 역할 부여
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

> 프로덕션 환경에서는 admin 계정 이메일/비밀번호를 즉시 변경해야 한다.
