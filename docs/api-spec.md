# API 명세서 — DevFocus

## 기본 정보

| 항목 | 내용 |
|------|------|
| Base URL (로컬) | `http://localhost:3001` |
| 응답 형식 | `application/json` |
| 인코딩 | UTF-8 (utf8mb4) |
| 인증 방식 | JWT Bearer Token |
| 토큰 유효기간 | 7일 |

---

## 인증 헤더

인증이 필요한 API는 아래 헤더를 포함해야 한다.

```
Authorization: Bearer {token}
```

---

## 공통 에러 응답 형식

```json
{ "error": "에러 메시지" }
```

| HTTP | 에러 메시지 | 설명 |
|------|-----------|------|
| 400 | `"입력값이 올바르지 않습니다"` | 유효성 검사 실패 |
| 401 | `"토큰 없음"` | Authorization 헤더 누락 |
| 401 | `"토큰 오류"` | JWT 만료/위변조 |
| 401 | `"이메일 또는 비밀번호가 올바르지 않습니다"` | 로그인 실패 |
| 403 | `"권한 없음"` | 역할 또는 소유권 부족 |
| 404 | `"리소스를 찾을 수 없습니다"` | 해당 ID 없음 |
| 409 | `"이미 존재하는 이메일입니다"` | 이메일 중복 |
| 500 | `"서버 오류가 발생했습니다"` | 내부 서버 오류 |

---

## 역할(Role) 정의

| 역할 | 설명 |
|------|------|
| `student` | 기본 사용자. 강의 수강, Q&A, 집중 타이머 등 이용 |
| `instructor` | student 권한 포함 + 강의/레슨 CRUD (본인 강의만) |
| `admin` | instructor 권한 포함 + 전체 관리 |

---

## API 목록

---

## 1. 인증 (Auth)

### POST `/api/auth/register` — 회원가입

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |
| Rate Limit | 15분 / 20회 |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `email` | string | O | 이메일 형식, UNIQUE |
| `password` | string | O | 4자 이상 |
| `nickname` | string | O | 2자 이상 |
| `role` | string | X | `student` \| `instructor` (기본값: `student`) |

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동",
  "role": "student"
}
```

**응답 201**
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

**에러**
- `409` — 이미 존재하는 이메일

---

### POST `/api/auth/login` — 로그인

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |
| Rate Limit | 15분 / 20회 |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `email` | string | O |
| `password` | string | O |

```json
{ "email": "user@example.com", "password": "password123" }
```

**응답 200**
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

**에러**
- `401` — 이메일 또는 비밀번호가 올바르지 않습니다

---

## 2. 사용자 (Users)

### GET `/api/users/me` — 내 정보 조회

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "홍길동",
  "role": "student",
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

---

### PATCH `/api/users/me` — 닉네임 수정

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `nickname` | string | O | 2자 이상 |

```json
{ "nickname": "새닉네임" }
```

**응답 200**
```json
{ "message": "닉네임이 수정되었습니다.", "nickname": "새닉네임" }
```

---

## 3. 강의 (Courses)

### GET `/api/courses` — 강의 목록 조회

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |

**응답 200**
```json
{
  "courses": [
    {
      "id": 1,
      "title": "React 기초부터 실전까지",
      "description": "React의 기본 개념부터 프로젝트 실습까지 배워봅니다.",
      "thumbnail": "/images/react.png",
      "category": "프론트엔드",
      "lessonCount": 3,
      "likeCount": 12,
      "enrollmentCount": 45,
      "instructor": { "id": 2, "nickname": "김강사" },
      "created_at": "2026-01-05T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/courses/:courseId` — 강의 상세 조회

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |

**경로 파라미터**: `courseId` — 강의 ID

**응답 200**
```json
{
  "course": {
    "id": 1,
    "title": "React 기초부터 실전까지",
    "description": "...",
    "thumbnail": "/images/react.png",
    "category": "프론트엔드",
    "instructor": { "id": 2, "nickname": "김강사" },
    "lessons": [
      { "id": 1, "title": "React란 무엇인가?", "video_url": "https://...", "order": 1, "duration": 600 },
      { "id": 2, "title": "JSX 문법 이해하기", "video_url": "https://...", "order": 2, "duration": 720 }
    ],
    "likeCount": 12,
    "enrollmentCount": 45
  }
}
```

**에러**
- `404` — 강의를 찾을 수 없습니다

---

### POST `/api/courses/:courseId/enroll` — 수강 신청

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 201**
```json
{ "message": "수강 신청이 완료되었습니다." }
```

**에러**
- `409` — 이미 수강 신청된 강의입니다

---

### POST `/api/courses/:courseId/like` — 강의 좋아요 토글

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 200**
```json
{ "liked": true, "likeCount": 13 }
```

---

### POST `/api/courses/:courseId/comment` — 강의 댓글 작성

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `content` | string | O |

```json
{ "content": "강의가 매우 유익했습니다!" }
```

**응답 201**
```json
{
  "comment": {
    "id": 5,
    "content": "강의가 매우 유익했습니다!",
    "user": { "id": 1, "nickname": "홍길동" },
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```

---

## 4. 학습 진도 (Progress)

### POST `/api/progress` — 진도 저장

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |
| 설명 | 영상별 시청 시간을 저장한다. 기존 기록이 있으면 UPSERT로 업데이트한다 |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `lessonId` | number | O | 양의 정수 |
| `watchedSeconds` | number | O | 0 이상 |

```json
{ "lessonId": 3, "watchedSeconds": 450 }
```

**응답 200**
```json
{ "message": "진도가 저장되었습니다.", "watchedSeconds": 450 }
```

---

### GET `/api/progress/:courseId` — 강의별 진도 조회

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**경로 파라미터**: `courseId` — 강의 ID

**응답 200**
```json
{
  "progress": [
    { "lessonId": 1, "title": "React란 무엇인가?", "watchedSeconds": 600, "duration": 600 },
    { "lessonId": 2, "title": "JSX 문법 이해하기", "watchedSeconds": 300, "duration": 720 },
    { "lessonId": 3, "title": "useState와 useEffect", "watchedSeconds": 0, "duration": 900 }
  ]
}
```

---

## 5. 집중 타이머 (Focus)

### POST `/api/focus/start` — 집중 시작

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 201**
```json
{
  "session": {
    "id": 10,
    "start_time": "2026-04-22T09:00:00.000Z"
  }
}
```

---

### POST `/api/focus/end` — 집중 종료

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `sessionId` | number | O | 시작 시 받은 세션 ID |

```json
{ "sessionId": 10 }
```

**처리**: `duration = end_time - start_time` (초 단위, 서버 자동 계산)

**응답 200**
```json
{
  "session": {
    "id": 10,
    "start_time": "2026-04-22T09:00:00.000Z",
    "end_time": "2026-04-22T10:30:00.000Z",
    "duration": 5400
  }
}
```

---

### GET `/api/focus/history` — 집중 기록 조회

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "sessions": [
    {
      "id": 10,
      "start_time": "2026-04-22T09:00:00.000Z",
      "end_time": "2026-04-22T10:30:00.000Z",
      "duration": 5400,
      "created_at": "2026-04-22T09:00:00.000Z"
    }
  ],
  "totalSeconds": 18000
}
```

---

## 6. Q&A 게시판 (QnA)

### GET `/api/qna` — 질문 목록 조회

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |

**응답 200**
```json
{
  "questions": [
    {
      "id": 1,
      "title": "useEffect 의존성 배열이 뭔가요?",
      "author": { "id": 1, "nickname": "홍길동" },
      "answerCount": 3,
      "created_at": "2026-04-20T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/qna` — 질문 작성

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `title` | string | O | 2자 이상 |
| `content` | string | O | 빈 값 불가 |

```json
{ "title": "useEffect 의존성 배열이 뭔가요?", "content": "두 번째 인자에 들어가는 배열이 정확히 어떤 역할을 하는지 궁금합니다." }
```

**응답 201**
```json
{
  "question": {
    "id": 2,
    "title": "useEffect 의존성 배열이 뭔가요?",
    "content": "두 번째 인자에...",
    "author": { "id": 1, "nickname": "홍길동" },
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```

---

### GET `/api/qna/:id` — 질문 상세 + 답변 목록

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |

**응답 200**
```json
{
  "question": {
    "id": 1,
    "title": "useEffect 의존성 배열이 뭔가요?",
    "content": "두 번째 인자에 들어가는 배열이...",
    "author": { "id": 1, "nickname": "홍길동" },
    "created_at": "2026-04-20T00:00:00.000Z"
  },
  "answers": [
    {
      "id": 1,
      "content": "의존성 배열에 포함된 값이 바뀔 때마다 effect가 재실행됩니다.",
      "author": { "id": 2, "nickname": "김강사" },
      "created_at": "2026-04-21T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/qna/answer` — 답변 작성

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `questionId` | number | O |
| `content` | string | O |

```json
{ "questionId": 1, "content": "의존성 배열에 포함된 값이 바뀔 때마다 effect가 재실행됩니다." }
```

**응답 201**
```json
{
  "answer": {
    "id": 2,
    "content": "의존성 배열에...",
    "author": { "id": 2, "nickname": "김강사" },
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```

---

## 7. 코드 스니펫 (Snippets)

### GET `/api/snippets` — 내 코드 스니펫 목록

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "snippets": [
    {
      "id": 1,
      "title": "useEffect 기본 패턴",
      "language": "javascript",
      "memo": "컴포넌트 마운트 시 실행",
      "created_at": "2026-04-15T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/snippets` — 코드 스니펫 저장

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**요청 바디**

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|:----:|---------|
| `title` | string | O | — |
| `code` | string | O | — |
| `language` | string | O | 기본값: `javascript` |
| `memo` | string | X | — |

```json
{
  "title": "useEffect 기본 패턴",
  "code": "useEffect(() => { /* ... */ }, []);",
  "language": "javascript",
  "memo": "컴포넌트 마운트 시 실행"
}
```

**응답 201**
```json
{
  "snippet": {
    "id": 1,
    "title": "useEffect 기본 패턴",
    "code": "useEffect(() => { /* ... */ }, []);",
    "language": "javascript",
    "memo": "컴포넌트 마운트 시 실행",
    "created_at": "2026-04-22T10:00:00.000Z"
  }
}
```

---

### GET `/api/snippets/:id` — 스니펫 상세 조회

| 인증 | O (본인만) |

**응답 200** — 스니펫 전체 필드 반환

---

### PATCH `/api/snippets/:id` — 스니펫 수정

| 인증 | O (본인만) |

**요청 바디**: 수정할 필드만 포함 (title, code, language, memo 모두 선택)

---

### DELETE `/api/snippets/:id` — 스니펫 삭제

| 인증 | O (본인만) |

**응답 200**
```json
{ "message": "스니펫이 삭제되었습니다." }
```

---

## 8. 결제 (Payments) — P3

### POST `/api/payments/initiate` — 결제 초기화

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |
| 설명 | 결제 요청을 초기화하고 paymentKey를 발급한다 (Mock 구현) |

**요청 바디**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `courseId` | number | O | 결제할 강의 ID |
| `amount` | number | X | 결제 금액 (기본값: 29900) |

```json
{ "courseId": 1, "amount": 29900 }
```

**응답 201**
```json
{
  "paymentKey": "pay_abc123xyz",
  "amount": 29900,
  "status": "pending"
}
```

**에러**
- `409` — 이미 수강 중인 강의 (completed 결제 존재)

---

### POST `/api/payments/confirm` — 결제 완료 처리

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |
| 설명 | 결제를 완료 처리하고 자동으로 수강 신청한다. 완료 메일 발송 (P3 Nodemailer) |

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `paymentKey` | string | O |

```json
{ "paymentKey": "pay_abc123xyz" }
```

**응답 200**
```json
{
  "message": "결제가 완료되었습니다. 수강 신청이 완료되었습니다.",
  "payment": {
    "id": 5,
    "courseId": 1,
    "amount": 29900,
    "status": "completed"
  }
}
```

**에러**
- `404` — 유효하지 않은 paymentKey
- `409` — 이미 처리된 결제

---

### GET `/api/payments/my` — 내 결제 내역

| 항목 | 내용 |
|------|------|
| 인증 | O (모든 역할) |

**응답 200**
```json
{
  "payments": [
    {
      "id": 5,
      "course": { "id": 1, "title": "React 기초부터 실전까지" },
      "amount": 29900,
      "status": "completed",
      "created_at": "2026-04-22T10:00:00.000Z"
    }
  ]
}
```

---

## 9. 강사 전용 (Instructor) — P2

> 필요 역할: `instructor` 또는 `admin`

### GET `/api/instructor/courses` — 내 강의 목록

**응답 200**
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

### POST `/api/instructor/courses` — 강의 생성

**요청 바디**

| 필드 | 타입 | 필수 |
|------|------|:----:|
| `title` | string | O |
| `description` | string | X |
| `thumbnail` | string | X |
| `category` | string | X |

**응답 201**
```json
{ "course": { "id": 4, "title": "Next.js 실전 프로젝트", "instructor_id": 2 } }
```

---

### PATCH `/api/instructor/courses/:id` — 강의 수정

**소유권 검증**: `instructor_id === req.user.id`

**요청 바디**: 수정할 필드만 포함 (title, description, thumbnail, category 선택)

**응답 200**
```json
{ "message": "강의가 수정되었습니다." }
```

**에러**
- `403` — 본인 강의가 아닙니다

---

### DELETE `/api/instructor/courses/:id` — 강의 삭제

**소유권 검증**: `instructor_id === req.user.id`

**응답 200**
```json
{ "message": "강의가 삭제되었습니다." }
```

---

### POST `/api/instructor/courses/:id/lessons` — 레슨 추가

**요청 바디**

| 필드 | 타입 | 필수 | 기본값 |
|------|------|:----:|--------|
| `title` | string | O | — |
| `video_url` | string | X | `null` |
| `order` | number | X | `0` |
| `duration` | number | X | `0` |

**응답 201**
```json
{ "lesson": { "id": 10, "course_id": 4, "title": "프로젝트 셋업", "order": 1 } }
```

---

### PATCH `/api/instructor/courses/:id/lessons/:lessonId` — 레슨 수정

**요청 바디**: 수정할 필드만 포함

**응답 200**
```json
{ "message": "레슨이 수정되었습니다." }
```

---

### DELETE `/api/instructor/courses/:id/lessons/:lessonId` — 레슨 삭제

**응답 200**
```json
{ "message": "레슨이 삭제되었습니다." }
```

---

## 10. 관리자 전용 (Admin) — P2

> 필요 역할: `admin`

### GET `/api/admin/stats` — 전체 통계

**응답 200**
```json
{
  "totalUsers": 152,
  "totalCourses": 12,
  "totalEnrollments": 430,
  "totalFocusSeconds": 1728000,
  "usersByRole": { "student": 148, "instructor": 3, "admin": 1 }
}
```

---

### GET `/api/admin/users` — 전체 사용자 목록

**응답 200**
```json
{
  "users": [
    { "id": 1, "email": "user@example.com", "nickname": "홍길동", "role": "student", "created_at": "2026-01-01T00:00:00.000Z" }
  ]
}
```

---

### PATCH `/api/admin/users/:id/role` — 사용자 역할 변경

**요청 바디**

```json
{ "role": "instructor" }
```

유효값: `student` \| `instructor` \| `admin`

**응답 200**
```json
{ "message": "역할이 변경되었습니다.", "user": { "id": 2, "role": "instructor" } }
```

---

### DELETE `/api/admin/users/:id` — 사용자 강제 삭제

**응답 200**
```json
{ "message": "사용자가 삭제되었습니다." }
```

---

### GET `/api/admin/courses` — 전체 강의 목록

**응답 200**
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

### DELETE `/api/admin/courses/:id` — 강의 강제 삭제

**응답 200**
```json
{ "message": "강의가 삭제되었습니다." }
```

---

## 11. Health Check — P3

### GET `/health` — 서버 상태 확인

| 항목 | 내용 |
|------|------|
| 인증 | 불필요 |
| 설명 | 서버 상태와 업타임을 반환한다 (모니터링/배포 확인용) |

**응답 200**
```json
{
  "status": "ok",
  "uptime": 86400,
  "timestamp": "2026-04-22T10:00:00.000Z"
}
```

---

## 12. API 엔드포인트 요약

| Method | Endpoint | 인증 | 역할 | 설명 |
|--------|----------|:----:|------|------|
| POST | `/api/auth/register` | X | — | 회원가입 |
| POST | `/api/auth/login` | X | — | 로그인 |
| GET | `/api/users/me` | O | 모두 | 내 정보 조회 |
| PATCH | `/api/users/me` | O | 모두 | 닉네임 수정 |
| GET | `/api/courses` | X | — | 강의 목록 |
| GET | `/api/courses/:id` | X | — | 강의 상세 |
| POST | `/api/courses/:id/enroll` | O | 모두 | 수강 신청 |
| POST | `/api/courses/:id/like` | O | 모두 | 좋아요 토글 |
| POST | `/api/courses/:id/comment` | O | 모두 | 댓글 작성 |
| POST | `/api/progress` | O | 모두 | 진도 저장 |
| GET | `/api/progress/:courseId` | O | 모두 | 진도 조회 |
| POST | `/api/focus/start` | O | 모두 | 집중 시작 |
| POST | `/api/focus/end` | O | 모두 | 집중 종료 |
| GET | `/api/focus/history` | O | 모두 | 집중 기록 |
| GET | `/api/qna` | X | — | 질문 목록 |
| POST | `/api/qna` | O | 모두 | 질문 작성 |
| GET | `/api/qna/:id` | X | — | 질문 상세 |
| POST | `/api/qna/answer` | O | 모두 | 답변 작성 |
| GET | `/api/snippets` | O | 모두 | 스니펫 목록 |
| POST | `/api/snippets` | O | 모두 | 스니펫 저장 |
| GET | `/api/snippets/:id` | O | 모두(본인) | 스니펫 상세 |
| PATCH | `/api/snippets/:id` | O | 모두(본인) | 스니펫 수정 |
| DELETE | `/api/snippets/:id` | O | 모두(본인) | 스니펫 삭제 |
| POST | `/api/payments/initiate` | O | 모두 | 결제 초기화 |
| POST | `/api/payments/confirm` | O | 모두 | 결제 완료 |
| GET | `/api/payments/my` | O | 모두 | 결제 내역 |
| GET | `/api/instructor/courses` | O | instructor+ | 내 강의 목록 |
| POST | `/api/instructor/courses` | O | instructor+ | 강의 생성 |
| PATCH | `/api/instructor/courses/:id` | O | instructor+ | 강의 수정 |
| DELETE | `/api/instructor/courses/:id` | O | instructor+ | 강의 삭제 |
| POST | `/api/instructor/courses/:id/lessons` | O | instructor+ | 레슨 추가 |
| PATCH | `/api/instructor/courses/:id/lessons/:lessonId` | O | instructor+ | 레슨 수정 |
| DELETE | `/api/instructor/courses/:id/lessons/:lessonId` | O | instructor+ | 레슨 삭제 |
| GET | `/api/admin/stats` | O | admin | 전체 통계 |
| GET | `/api/admin/users` | O | admin | 사용자 목록 |
| PATCH | `/api/admin/users/:id/role` | O | admin | 역할 변경 |
| DELETE | `/api/admin/users/:id` | O | admin | 사용자 삭제 |
| GET | `/api/admin/courses` | O | admin | 전체 강의 관리 |
| DELETE | `/api/admin/courses/:id` | O | admin | 강의 강제 삭제 |
| GET | `/health` | X | — | 서버 상태 |
