P3 요구사항 명세서 - DevFocus 운영형 서비스

1. 개요
P2에서 구축한 인증/권한 시스템 위에 운영에 필요한 외부 연동, 스케줄러, 모니터링, 보안, 결제 기능을 추가한다.

2. 기능 목록

2-1. 보안 강화
- Helmet: XSS, Clickjacking, MIME sniffing 방어
- Rate Limiting: API 15분/200회, 인증 API 15분/20회
- SQL Injection 방어: mysql2 prepared statement 전면 적용
- 입력 최대 크기 제한: express.json({ limit: '1mb' })

2-2. 구조화 로그 (Winston)
- 모든 HTTP 요청 로그: method, url, status, 응답시간
- 에러 로그: logs/error.log
- 전체 로그: logs/combined.log
- 개발환경: 콘솔 컬러 출력

2-3. 이메일 알림 (Nodemailer)
- 회원가입 환영 메일
- 수강 신청 완료 메일
- Gmail SMTP 사용

2-4. Discord Webhook 알림
- 일별 통계 리포트 (매일 오전 9시)
- 에러 발생 시 즉시 알림

2-5. 스케줄러 (node-cron)
- 매일 09:00: 일별 통계 Discord 전송
- 매주 월요일 03:00: 90일 이상 된 집중세션 삭제
- 매시간: pending 결제 30분 초과 시 failed 처리

2-6. 결제 모듈 (Mock 구현)
- POST /api/payments/initiate: 결제 초기화 (paymentKey 발급)
- POST /api/payments/confirm: 결제 완료 처리 + 자동 수강 신청
- GET /api/payments/my: 내 결제 내역
- 결제 완료 시 수강 신청 + 이메일 발송 자동화

2-7. Health Check
- GET /health: 서버 상태, 업타임 반환

2-8. 성능 최적화 (DB 인덱스)
- progress(user_id), progress(lesson_id)
- focus_sessions(user_id), focus_sessions(created_at)
- enrollments(user_id), code_snippets(user_id)
- payments(user_id), courses(instructor_id)

3. 환경변수

PORT, NODE_ENV
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
DISCORD_WEBHOOK_URL
FRONTEND_URL
LOG_LEVEL

4. 배포 아키텍처

GitHub Actions CI/CD
  push to main ->
    CI: lint + type-check + build 검증
    CD: Docker 이미지 빌드 -> GHCR 푸시 -> Render 배포 트리거

Docker
  db: MySQL 8.0
  backend: Node 20 Alpine
  frontend: Next.js standalone
