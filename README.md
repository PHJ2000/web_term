# Student Schedule & Task Manager

Node.js, Express, MySQL 기반으로 만든 시간표·과목·할 일 관리 웹앱입니다.  
웹 UI와 함께 `/api/tasks` JSON API를 제공하며, 세션 기반 로그인 후 과목과 할 일을 관리할 수 있습니다.

## 주요 기능

- 회원가입 / 로그인 / 로그아웃
- Passport Local 기반 인증
- 세션 로그인 유지
- 과목(Course) 등록 및 조회
- 할 일(Task) 생성 / 조회 / 상태 변경 / 삭제
- 오늘 마감 할 일, 이번 주 할 일 조회
- `/api/tasks` 기반 JSON API 제공
- 입력값 및 소유권 검증

## 기술 스택

- Node.js
- Express
- MySQL
- Passport Local
- express-session
- bcryptjs
- EJS

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정합니다.

```env
SESSION_SECRET=your-strong-secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
PORT=3000
```

`SESSION_SECRET`가 없으면 서버는 시작하지 않습니다.

## DB 초기화

`schema.sql`을 실행해 테이블을 생성합니다.

```bash
mysql -u <user> -p <db_name> < schema.sql
```

## 실행

```bash
npm install
npm start
```

기본 포트는 `3000`입니다.

## 주요 API

- `GET /api/tasks`
  - 전체 할 일 목록 조회
- `GET /api/tasks/today`
  - 오늘 마감 할 일 조회
- `GET /api/tasks/week`
  - 7일 내 마감 할 일 조회
- `POST /api/tasks`
  - 새 할 일 생성
- `PATCH /api/tasks/:id`
  - 할 일 상태 변경
- `DELETE /api/tasks/:id`
  - 할 일 삭제

모든 API는 로그인된 세션이 필요합니다.

## 입력 검증

- `priority`는 1~3 범위만 허용
- 잘못된 `course_id`는 거부
- `status`는 `pending` 또는 `done`만 허용
- 다른 사용자의 과목을 연결하지 못하도록 소유권을 확인합니다.
