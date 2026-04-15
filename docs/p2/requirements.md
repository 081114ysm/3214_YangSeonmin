P2 요구사항 명세서 - DevFocus 인증/권한 시스템

1. 개요
P1에서 구축한 기본 서비스에 JWT 기반 인증과 역할 기반 접근 제어(RBAC)를 추가한다.
사용자는 학생(student), 강사(instructor), 관리자(admin) 세 가지 역할을 가진다.

2. 역할별 권한

student (기본값)
- 강의 열람, 수강 신청, 댓글 작성
- 집중 타이머, Q&A, 코드 스니펫 이용
- 결제 기능 이용

instructor
- student 권한 포함
- 강의 생성, 수정, 삭제 (본인 강의만)
- 레슨 추가, 수정, 삭제 (본인 강의만)
- 강사 대시보드 접근

admin
- instructor 권한 포함
- 모든 사용자 역할 변경
- 모든 강의 삭제
- 전체 통계 조회

3. 인증 방식
- JWT (JSON Web Token) 사용
- 토큰 만료: 7일
- Payload: { id, role }
- Authorization 헤더: Bearer {token}

4. API 엔드포인트

인증
POST /api/auth/register - 회원가입 (role 선택: student/instructor)
POST /api/auth/login    - 로그인 (토큰 + role 반환)

관리자 (admin 전용)
GET    /api/admin/stats              - 전체 통계
GET    /api/admin/users              - 전체 사용자 목록
PATCH  /api/admin/users/:id/role     - 사용자 역할 변경
DELETE /api/admin/users/:id          - 사용자 삭제
GET    /api/admin/courses            - 전체 강의 목록
DELETE /api/admin/courses/:id        - 강의 강제 삭제

강사 (instructor/admin)
GET    /api/instructor/courses               - 내 강의 목록
POST   /api/instructor/courses               - 강의 생성
PATCH  /api/instructor/courses/:id           - 강의 수정
DELETE /api/instructor/courses/:id           - 강의 삭제
POST   /api/instructor/courses/:id/lessons   - 레슨 추가
PATCH  /api/instructor/courses/:id/lessons/:lessonId - 레슨 수정
DELETE /api/instructor/courses/:id/lessons/:lessonId - 레슨 삭제

5. 보안 요구사항
- JWT secret 환경변수 분리 (하드코딩 금지)
- 역할 검증 미들웨어 적용
- Rate limiting: 인증 API 15분/20회
- Helmet 보안 헤더 적용
- 본인 강의 외 수정/삭제 방지 (instructor_id 검증)
