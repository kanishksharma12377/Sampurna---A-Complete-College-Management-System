# API Reference — Sampurna ERP v2

**Base URL**: `http://localhost:3001`  
**Content-Type**: `application/json`  
**Server**: `backend/server.js` (Node.js + Express 5)

---

## Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ username, password }` | `{ success, role, username }` |

**Passwords**: Admin → `admin123`, Students → `student123`

---

## Students

| Method | Endpoint | Body / Params | Response |
|--------|----------|---------------|----------|
| GET | `/api/students` | — | Array of all students |
| GET | `/api/students/:id` | `:id` = student_id | Single student object |
| POST | `/api/students` | `{ student_id, name, email, course_year, phone, address, gender, semester, fathers_name, dob }` | `{ success, message }` |
| PUT | `/api/students/:id` | Same as POST (without student_id) | `{ success, message }` |
| DELETE | `/api/students/:id` | — | `{ success, message }` |

> POST also creates a user account with password `student123`.

---

## Fee Records

| Method | Endpoint | Body / Params | Response |
|--------|----------|---------------|----------|
| GET | `/api/fee-records` | — | All records (with `fees[]` items) |
| GET | `/api/fee-records/:studentId` | `:studentId` | Records for one student |
| POST | `/api/fee-records` | `{ receiptNo, studentId, studentName, courseYear, fees: [{name, amount}], totalAmount, paymentMode, transactionId, remarks, date }` | `{ success, message }` |

> Uses DB transaction to insert both `fee_records` and `fee_items`.

---

## Announcements

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/announcements` | — | Latest 20 announcements |
| POST | `/api/announcements` | `{ title, message, audience }` | `{ success, message }` |
| DELETE | `/api/announcements/:id` | — | `{ success }` |

**Audience options**: `all`, `hostel`, `library`, `exams`

---

## Departments

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/departments` | — | All departments (with `student_count`) |
| POST | `/api/departments` | `{ name, hod_name, hod_email, hod_phone, description }` | `{ success, message }` |
| PUT | `/api/departments/:id` | Same as POST | `{ success, message }` |
| DELETE | `/api/departments/:id` | — | `{ success }` |

---

## Hostel — Rooms

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/hostel/rooms` | — | All rooms (with `occupants[]`, `occupied` count) |
| POST | `/api/hostel/rooms` | `{ room_no, block, capacity, room_type, floor }` | `{ success, message }` |
| DELETE | `/api/hostel/rooms/:roomNo` | — | `{ success }` |

## Hostel — Allocations

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/hostel/allocations` | — | All allocations (joined with student & room) |
| POST | `/api/hostel/allocations` | `{ student_id, room_no }` | `{ success, message }` |
| DELETE | `/api/hostel/allocations/:studentId` | — | `{ success }` |

> POST checks room capacity before allocating.

---

## Exams

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/exams` | — | All exams (sorted by date ASC) |
| POST | `/api/exams` | `{ title, course, exam_date, exam_time, description }` | `{ success, message }` |
| DELETE | `/api/exams/:id` | — | `{ success }` |

---

## Library — Books

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/library/books` | — | All books |
| POST | `/api/library/books` | `{ title, author, isbn, total_copies, category }` | `{ success, message }` |
| DELETE | `/api/library/books/:id` | — | `{ success }` |

## Library — Cards

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/library/cards` | — | All cards (with `issued_books[]`) |
| GET | `/api/library/cards/:studentId` | — | Single card (with `issued_books[]`) |
| POST | `/api/library/cards` | `{ student_id, student_name, class, roll_no }` | `{ success, message, card_no }` |

## Library — Issue / Return

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/library/issue` | `{ card_no, book_id, due_date? }` | `{ success, message }` |
| POST | `/api/library/return` | `{ issue_id }` | `{ success, message }` |

> Both use transactions. Issue decrements `available_copies`, return increments it.  
> Default `due_date` = 14 days from now.

---

## Stats (Dashboard)

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/stats` | `{ totalStudents, totalFeeRecords, totalRevenue, hostelAllocated, totalRooms, totalBooks, issuedBooks, upcomingExams, totalDepts }` |

---

## PDF Receipt

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/generate-receipt` | `{ receiptNo, studentId, studentName, courseYear, fees: [{name, amount}], paymentMode, transactionId, remarks, date }` | PDF binary stream |

> Returns `Content-Type: application/pdf`. Download as blob on the frontend.

---

## Static Files

| Path | Serves |
|------|--------|
| `/` | `frontend/public/index.html` |
| `/home.html` | 301 → `/` |
| `/docs/*` | `frontend/docs/*` |
| `/*` | `frontend/public/*` |
