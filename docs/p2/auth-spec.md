P2 인증 명세서 - DevFocus

1. JWT 토큰 구조

Header
  alg: HS256
  typ: JWT

Payload
  id: 사용자 ID (number)
  role: 역할 (student | instructor | admin)
  iat: 발급 시각
  exp: 만료 시각 (7일)

2. 요청 헤더

Authorization: Bearer {token}

3. 에러 응답 코드

401 Unauthorized - 토큰 없음 또는 만료
  { "error": "토큰 없음" }
  { "error": "토큰 오류" }

403 Forbidden - 권한 부족
  { "error": "권한 없음" }

409 Conflict - 중복 이메일
  { "error": "이미 존재하는 이메일입니다" }

4. 역할별 접근 가능 API

student
  GET  /api/courses
  GET  /api/courses/:id
  POST /api/courses/:id/enroll
  POST /api/courses/:id/like
  POST /api/courses/:id/comment
  GET/POST /api/progress
  GET/POST /api/focus
  GET/POST /api/qna
  GET/POST /api/snippets
  POST /api/payments/initiate
  POST /api/payments/confirm

instructor (student 포함)
  GET/POST/PATCH/DELETE /api/instructor/courses
  POST/PATCH/DELETE /api/instructor/courses/:id/lessons

admin (모두 포함)
  GET/PATCH/DELETE /api/admin/users
  GET/DELETE /api/admin/courses
  GET /api/admin/stats

5. 보안 체크리스트 (OWASP)

A01 Broken Access Control
  - requireRole 미들웨어로 역할 검증
  - instructor_id 소유권 검증

A02 Cryptographic Failures
  - JWT_SECRET 환경변수 분리
  - bcrypt salt rounds: 10

A03 Injection
  - mysql2 prepared statement 사용 (? 파라미터)
  - 입력값 trim() 처리

A05 Security Misconfiguration
  - Helmet 보안 헤더 적용
  - CORS origin 제한

A07 Identification and Authentication Failures
  - Rate limiting: 인증 API 15분/20회
  - 토큰 만료 7일 설정
