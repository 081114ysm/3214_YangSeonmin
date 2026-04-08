# DevFocus 개발 환경 설정 가이드

## 사전 요구사항

- Node.js 18 이상
- MySQL 8.0
- npm

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. MySQL 데이터베이스 생성

```bash
mysql -u root -p < backend/src/config/schema.sql
```

> Windows에서 mysql이 PATH에 없는 경우:
> ```
> "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root -p < backend\src\config\schema.sql
> ```

### 3. DB 접속 정보 확인

`backend/src/config/db.js` 파일에서 본인 환경에 맞게 수정:

```js
host: 'localhost',
user: 'root',
password: '본인 MySQL 비밀번호',
database: 'devfocus'
```

### 4. 서버 실행

```bash
# 백엔드 (포트 3001)
cd backend && node src/app.js

# 프론트엔드 (포트 3000) - 별도 터미널
cd frontend && npm run dev
```

### 5. 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001/api

## 참고

- `.env` 파일은 별도로 사용하지 않습니다
- DB 스키마 파일: `backend/src/config/schema.sql` (테이블 생성 + 샘플 데이터 포함)
