# 12312312 (Student Schedule & Task Manager)

A small timetable/course/task management web app built with Node.js + Express (CommonJS).  
It provides a web UI and a JSON API under `/api/tasks`.

## Requirements

- Node.js 18+ (recommended)
- MySQL 8+

## Install

```bash
npm install
```

## Environment Variables (.env)

Create a `.env` file in the project root.

Required:

```env
SESSION_SECRET=your-strong-secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

Optional:

```env
PORT=3000
```

If `SESSION_SECRET` is not set, the server will throw an error and exit on startup.

## Database Setup

Run `schema.sql` to create tables.

```bash
mysql -u <user> -p <db_name> < schema.sql
```

## Run

```bash
npm start
```

Default port is `3000`. If it’s already in use, run with another port:

```bash
PORT=3001 npm start
```

## Features

- Login/Signup (session-based)
- Course add/list
- Task add/list/complete/delete
- Dashboard for today/this week tasks
- JSON API for tasks

## Input Validation Rules

The following minimal validations are applied in both web and API.

### Creating a Course

- `day_of_week` must be between 0 and 6 (Sun–Sat).  
  Out-of-range values are rejected (web shows a flash error).
- If both `start_time` and `end_time` are present,  
  `start_time` must be less than or equal to `end_time`; otherwise rejected.

### Creating a Task

- `priority` must be 1–3.  
  - Web: out-of-range becomes default `2`.
  - API: out-of-range is rejected with `400 { error: 'Invalid priority' }`.
- If `course_id` is provided, ownership is verified.  
  - Web: invalid ownership saves with `course_id=null` and shows a flash error.
  - API: invalid ownership is rejected with `400 { error: 'Invalid course_id' }`.

### Updating Task Status (API)

- In `PATCH /api/tasks/:id`, `status` must be `'pending'` or `'done'`.  
  Invalid values are rejected with `400 { error: 'Invalid status' }`.

## API Summary

All API endpoints require an authenticated session (otherwise 401).

- `GET /api/tasks` : list all tasks
- `GET /api/tasks/today` : tasks due today
- `GET /api/tasks/week` : tasks due within 7 days
- `POST /api/tasks` : create a task  
  example body:
  ```json
  { "title":"...", "description":"...", "due_date":"2025-12-31", "priority":2, "course_id":1 }
  ```
- `PATCH /api/tasks/:id` : update task status  
  example body:
  ```json
  { "status":"done" }
  ```
- `DELETE /api/tasks/:id` : delete a task

### Error Responses

- Invalid `priority` on create → `400 { error: 'Invalid priority' }`
- Other user / non-existent `course_id` on create → `400 { error: 'Invalid course_id' }`
- Invalid `status` on patch → `400 { error: 'Invalid status' }`
- PATCH/DELETE with non-existent `id` → `404 { error: 'Not found' }`

## Manual Test Checklist

Web:

1. After login, on `/courses`
   - Enter `day_of_week=7` → expect flash error
   - Enter `start_time=15:00`, `end_time=13:00` → expect flash error
2. On `/tasks`
   - Enter `priority=4` → saved priority should be `2`
   - Force-submit another user’s `course_id` → not linked, flash error shown
3. Complete a non-existent task (`/tasks/:id/complete`) → expect flash error

API (example with curl):

```bash
# priority validation
curl -X POST -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{"title":"t","priority":4}' \
  http://localhost:3000/api/tasks

# status validation
curl -X PATCH -H "Content-Type: application/json" \
  -b cookie.txt \
  -d '{"status":"foo"}' \
  http://localhost:3000/api/tasks/1
```

## License

For coursework/learning purposes.

