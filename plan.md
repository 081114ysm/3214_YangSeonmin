### Auth

- POST /auth/register → 회원가입
- POST /auth/login → 로그인

인증 관련 기본 기능만 우선 정의

---

### Users

- GET /users/me → 내 정보 조회
- PATCH /users/me → 사용자 정보 수정

로그인 이후 사용자 정보 관리 기능

---

### Courses

- GET /courses → 강의 목록 조회
- GET /courses/:courseId → 강의 상세 조회

강의 탐색 및 정보 확인

---

### Lessons

- GET /lessons/:lessonId → 강의 영상 조회

 실제 강의 시청 기능

---

### Progress

- POST /progress → 강의 진도 저장
- GET /progress/:courseId → 진도 조회

 학습 진행 상태 관리

---

### Focus

- POST /focus/start → 집중 시작
- POST /focus/end → 집중 종료
- GET /focus/history → 집중 기록 조회

집중 시간 측정 및 기록
### Auth

- POST /auth/register → 회원가입
- POST /auth/login → 로그인

인증 관련 기본 기능만 우선 정의

---

### Users

- GET /users/me → 내 정보 조회
- PATCH /users/me → 사용자 정보 수정

로그인 이후 사용자 정보 관리 기능

---

### Courses

- GET /courses → 강의 목록 조회
- GET /courses/:courseId → 강의 상세 조회

강의 탐색 및 정보 확인

---

### Lessons

- GET /lessons/:lessonId → 강의 영상 조회

 실제 강의 시청 기능

---

### Progress

- POST /progress → 강의 진도 저장
- GET /progress/:courseId → 진도 조회

 학습 진행 상태 관리

---

### Focus

- POST /focus/start → 집중 시작
- POST /focus/end → 집중 종료
- GET /focus/history → 집중 기록 조회

집중 시간 측정 및 기록