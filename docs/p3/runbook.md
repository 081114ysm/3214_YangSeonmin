P3 운영 가이드 (Runbook) - DevFocus

1. 서비스 시작

로컬 개발
  cd backend && npm install && node src/app.js
  cd frontend && npm install && npm run dev

Docker (전체 스택)
  cp .env.example .env       # 환경변수 설정
  docker compose up -d       # 백그라운드 실행
  docker compose logs -f     # 로그 확인

2. 배포 절차

자동 배포 (CI/CD)
  git push origin main       # main 브랜치에 push 시 자동 실행
  GitHub Actions CI -> CD -> Render 배포 트리거

수동 배포
  docker build -t devfocus-backend ./backend
  docker build -t devfocus-frontend ./frontend
  docker compose up -d --force-recreate

3. DB 마이그레이션

신규 DB 설정
  mysql -u root -p < backend/src/config/schema.sql

P2/P3 마이그레이션 (기존 DB)
  mysql -u root -p < backend/src/config/schema_p2_p3.sql

관리자 계정 설정
  UPDATE users SET role='admin' WHERE email='admin@example.com';

4. 롤백 절차

Docker 이전 이미지로 롤백
  docker pull ghcr.io/{repo}/backend:sha-{이전커밋해시}
  docker compose down backend
  docker compose up -d backend

5. 모니터링

Health Check
  curl http://localhost:3001/health

로그 확인
  docker exec devfocus-backend tail -f logs/combined.log
  docker exec devfocus-backend tail -f logs/error.log

6. 장애 대응

DB 연결 실패
  docker compose restart db
  docker compose restart backend

이메일 발송 실패
  logs/error.log 확인
  EMAIL_USER, EMAIL_PASS 환경변수 점검
  Gmail 앱 비밀번호 재발급

Discord 알림 미전송
  DISCORD_WEBHOOK_URL 유효성 확인
  Discord 서버 채널 웹훅 재생성

스케줄러 중단
  job_logs 테이블에서 마지막 실행 시각 확인
  서버 재시작: docker compose restart backend

7. 사고 보고서 템플릿

발생일시:
서비스:
심각도: P1(전체장애) / P2(일부장애) / P3(성능저하)
증상:
원인:
조치:
재발방지:
