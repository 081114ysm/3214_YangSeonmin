# DevFocus ERD (Entity Relationship Diagram)

## 테이블 관계도

```
┌──────────────────┐
│      users       │
├──────────────────┤
│ PK  id           │──────────────────────────────────┐
│     email        │                                   │
│     password     │                                   │
│     nickname     │                                   │
│     created_at   │                                   │
└──────────────────┘                                   │
        │                                              │
        │ 1:N                                          │
        ▼                                              │
┌──────────────────┐    ┌──────────────────┐          │
│   questions      │    │    answers       │          │
├──────────────────┤    ├──────────────────┤          │
│ PK  id           │◄───│ FK  question_id  │          │
│ FK  user_id      │    │ PK  id           │          │
│     title        │    │ FK  user_id      │──────────┤
│     content      │    │     content      │          │
│     created_at   │    │     created_at   │          │
└──────────────────┘    └──────────────────┘          │
                                                       │
┌──────────────────┐                                   │
│  focus_sessions  │                                   │
├──────────────────┤                                   │
│ PK  id           │                                   │
│ FK  user_id      │───────────────────────────────────┤
│     start_time   │                                   │
│     end_time     │                                   │
│     duration     │                                   │
│     created_at   │                                   │
└──────────────────┘                                   │
                                                       │
┌──────────────────┐    ┌──────────────────┐          │
│    courses       │    │    progress      │          │
├──────────────────┤    ├──────────────────┤          │
│ PK  id           │    │ PK  id           │          │
│     title        │    │ FK  user_id      │──────────┘
│     description  │    │ FK  lesson_id    │
│     thumbnail    │    │     watched_sec  │
│     created_at   │    │     updated_at   │
└──────────────────┘    └──────────────────┘
        │                        ▲
        │ 1:N                    │
        ▼                        │
┌──────────────────┐             │
│    lessons       │             │
├──────────────────┤             │
│ PK  id           │─────────────┘
│ FK  course_id    │
│     title        │
│     video_url    │
│     order        │
│     duration     │
│     created_at   │
└──────────────────┘
```

## 테이블 상세 명세

### 1. users (사용자)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 사용자 고유 ID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 (로그인 ID) |
| password | VARCHAR(255) | NOT NULL | 비밀번호 (bcrypt 해시) |
| nickname | VARCHAR(100) | NOT NULL | 닉네임 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 가입일시 |

### 2. courses (강의)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 강의 고유 ID |
| title | VARCHAR(255) | NOT NULL | 강의 제목 |
| description | TEXT | | 강의 설명 |
| thumbnail | VARCHAR(500) | | 썸네일 URL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 등록일시 |

### 3. lessons (강의 영상)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 영상 고유 ID |
| course_id | INT | FK → courses(id), NOT NULL | 소속 강의 ID |
| title | VARCHAR(255) | NOT NULL | 영상 제목 |
| video_url | VARCHAR(500) | | 영상 URL |
| order | INT | DEFAULT 0 | 정렬 순서 |
| duration | INT | DEFAULT 0 | 영상 길이(초) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 등록일시 |

### 4. progress (학습 진도)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 진도 고유 ID |
| user_id | INT | FK → users(id), NOT NULL | 사용자 ID |
| lesson_id | INT | FK → lessons(id), NOT NULL | 영상 ID |
| watched_seconds | INT | DEFAULT 0 | 시청 시간(초) |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 마지막 수정일시 |

> UNIQUE KEY (user_id, lesson_id) — 사용자별 영상당 1개의 진도 기록

### 5. focus_sessions (집중 세션)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 세션 고유 ID |
| user_id | INT | FK → users(id), NOT NULL | 사용자 ID |
| start_time | DATETIME | NOT NULL | 집중 시작 시간 |
| end_time | DATETIME | | 집중 종료 시간 |
| duration | INT | | 집중 시간(초) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |

### 6. questions (질문)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 질문 고유 ID |
| user_id | INT | FK → users(id), NOT NULL | 작성자 ID |
| title | VARCHAR(255) | NOT NULL | 질문 제목 |
| content | TEXT | | 질문 내용 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

### 7. answers (답변)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INT | PK, AUTO_INCREMENT | 답변 고유 ID |
| question_id | INT | FK → questions(id), NOT NULL | 질문 ID |
| user_id | INT | FK → users(id), NOT NULL | 작성자 ID |
| content | TEXT | NOT NULL | 답변 내용 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 작성일시 |

## 관계 요약

| 관계 | 설명 |
|------|------|
| users → questions | 1:N (사용자가 여러 질문 작성) |
| users → answers | 1:N (사용자가 여러 답변 작성) |
| users → focus_sessions | 1:N (사용자가 여러 집중 세션) |
| users → progress | 1:N (사용자가 여러 진도 기록) |
| courses → lessons | 1:N (강의에 여러 영상) |
| lessons → progress | 1:N (영상별 여러 진도 기록) |
| questions → answers | 1:N (질문에 여러 답변) |

모든 FK에 `ON DELETE CASCADE` 적용 — 부모 삭제 시 자식 데이터 자동 삭제
