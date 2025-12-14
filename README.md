# 12312312 (Student Schedule & Task Manager)

Node.js + Express(CommonJS) 기반의 간단한 시간표/과목/할일 관리 웹앱입니다.  
웹 UI와 함께 `/api/tasks` JSON API를 제공합니다.

## 요구 환경

- Node.js 18+ (권장)
- MySQL 8+

## 설치

```bash
npm install
```

## 환경변수(.env)

프로젝트 루트에 `.env` 파일을 생성하세요.

필수:

```env
SESSION_SECRET=your-strong-secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

선택:

```env
PORT=3000
```

`SESSION_SECRET`가 없으면 서버는 시작 시 즉시 에러를 내고 종료됩니다.

## DB 초기화

`schema.sql`을 실행해 테이블을 생성하세요.

```bash
mysql -u <user> -p <db_name> < schema.sql
```

## 실행

```bash
npm start
```

기본 포트는 `3000`이며, 이미 사용 중이면 다른 포트로 실행할 수 있습니다.

```bash
PORT=3001 npm start
```

## 주요 기능

- 로그인/회원가입(세션 기반)
- 과목(Course) 추가/조회
- 할일(Task) 추가/조회/완료/삭제
- 대시보드에서 오늘/이번 주 할일 확인
- JSON API로 할일 목록/생성/상태 변경/삭제

## 입력 검증 규칙

웹과 API 모두 다음 최소 검증이 적용되어 있습니다.

### Course 생성

- `day_of_week`는 0-6만 허용(일~토).  
  범위 밖이면 생성 거부(웹은 flash 에러).
- `start_time`과 `end_time`이 둘 다 있을 때  
  `start_time <= end_time` 이어야 하며, 아니면 거부.

### Task 생성

- `priority`는 1~3만 허용.  
  - 웹: 범위 밖이면 기본값 2로 저장.
  - API: 범위 밖이면 `400 { error: 'Invalid priority' }`.
- `course_id`가 있을 경우 **반드시 본인 소유 강의인지 확인**합니다.  
  - 웹: 소유권 검증 실패 시 `course_id=null`로 저장하고 flash 에러 표시.
  - API: 소유권 검증 실패 시 `400 { error: 'Invalid course_id' }`.

### Task 상태 업데이트(API)

- `PATCH /api/tasks/:id`에서 `status`는 `'pending'` 또는 `'done'`만 허용.  
  잘못된 값이면 `400 { error: 'Invalid status' }`.

## API 요약

모든 API는 로그인된 세션이 필요합니다(미로그인 시 401).

- `GET /api/tasks` : 모든 할일 목록
- `GET /api/tasks/today` : 오늘 마감 할일
- `GET /api/tasks/week` : 7일 내 마감 할일
- `POST /api/tasks` : 할일 생성  
  body 예:
  ```json
  { "title":"...", "description":"...", "due_date":"2025-12-31", "priority":2, "course_id":1 }
  ```
- `PATCH /api/tasks/:id` : 할일 상태 변경  
  body 예:
  ```json
  { "status":"done" }
  ```
- `DELETE /api/tasks/:id` : 할일 삭제

### 실패 응답

- 생성 시 잘못된 `priority` → `400 { error: 'Invalid priority' }`
- 생성 시 타인/존재하지 않는 `course_id` → `400 { error: 'Invalid course_id' }`
- 상태 업데이트 시 잘못된 `status` → `400 { error: 'Invalid status' }`
- 없는 `id`를 PATCH/DELETE → `404 { error: 'Not found' }`

## 수동 테스트 체크리스트

웹:

1. 로그인 후 `/courses`에서
   - `day_of_week=7` 입력 → 에러 flash 확인
   - `start_time=15:00`, `end_time=13:00` → 에러 flash 확인
2. `/tasks`에서
   - `priority=4` 입력 → 저장 시 우선순위가 2로 들어가는지 확인
   - 타인 `course_id`를 강제로 넣어 전송 → 연결되지 않고 에러 flash 확인
3. 존재하지 않는 작업 완료 요청(`/tasks/:id/complete`) → 에러 flash 확인

API(예: curl):

```bash
# priority 검증
curl -X POST -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{"title":"t","priority":4}' \
  http://localhost:3000/api/tasks

# status 검증
curl -X PATCH -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{"status":"foo"}' \
  http://localhost:3000/api/tasks/1
```

## 라이선스

과제용/학습용 프로젝트입니다.
