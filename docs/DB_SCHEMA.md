# Database Schema — Sampurna ERP v2

**Database**: `sampurna_erp`  
**Engine**: MySQL (XAMPP)  
**Connection**: `root`/`root` @ `localhost:3306`  
**Schema file**: `backend/db-setup-v2.sql`

---

## Tables Overview

| # | Table | Purpose | Key Columns |
|---|-------|---------|-------------|
| 1 | `students` | Student records | `student_id` (UNIQUE), name, email, course_year, gender, semester, fathers_name, dob |
| 2 | `users` | Authentication | `username` (UNIQUE), password, role (admin/student) |
| 3 | `fee_records` | Fee receipts | `receipt_no` (UNIQUE), student_id (FK), total_amount, payment_mode, date |
| 4 | `fee_items` | Fee breakdown | `receipt_no` (FK), fee_name, amount |
| 5 | `announcements` | Notices/bulletins | title, message, audience (all/hostel/library/exams) |
| 6 | `departments` | Academic departments | `name` (UNIQUE), hod_name, hod_email, hod_phone |
| 7 | `hostel_rooms` | Room inventory | `room_no` (UNIQUE), block, capacity, room_type (Single/Double/Triple), floor |
| 8 | `hostel_allocations` | Student-room mapping | student_id (FK, UNIQUE), room_no (FK) |
| 9 | `exams` | Exam schedule | title, course, exam_date, exam_time, description |
| 10 | `library_books` | Book catalog | title, author, `isbn` (UNIQUE), total_copies, available_copies, category |
| 11 | `library_cards` | Student library cards | `card_no` (UNIQUE), `student_id` (UNIQUE, FK), student_name, class, roll_no |
| 12 | `library_issued_books` | Issue/return tracking | card_no (FK), book_id (FK), issued_at, due_date, returned_at |

---

## Relationships (Foreign Keys)

```
students.student_id ──<< fee_records.student_id (CASCADE)
fee_records.receipt_no ──<< fee_items.receipt_no (CASCADE)
students.student_id ──<< hostel_allocations.student_id (CASCADE)
hostel_rooms.room_no ──<< hostel_allocations.room_no (CASCADE)
students.student_id ──<< library_cards.student_id (CASCADE)
library_cards.card_no ──<< library_issued_books.card_no (CASCADE)
library_books.id ──<< library_issued_books.book_id (CASCADE)
```

All foreign keys use `ON DELETE CASCADE`.

---

## Sample Data Included

| Data | Count | Details |
|------|-------|---------|
| Admin user | 1 | admin / admin123 |
| Departments | 4 | CS, Mech, EE, Civil |
| Students | 5 | SMPRNA-0001 through SMPRNA-0005 |
| Student users | 5 | Password: student123 |
| Hostel rooms | 7 | Block A (4) + Block B (3) |
| Hostel allocations | 2 | Rahul→A-101, Amit→B-101 |
| Exams | 4 | One per department, April–May 2026 |
| Library books | 6 | CS(2), Mech(2), EE(1), Civil(1) |
| Library cards | 2 | Rahul (LIB-001), Priya (LIB-002) |
| Issued books | 1 | Rahul: "Introduction to Algorithms" |
| Fee records | 3 | Rahul ₹45k, Priya ₹25k, Amit ₹40k |
| Fee items | 7 | Tuition, Lab, Library, Exam, Hostel |
| Announcements | 4 | Welcome, Library, Hostel, Exams |

---

## Setup Instructions

1. Start XAMPP → Start MySQL.
2. Open phpMyAdmin → SQL tab.
3. Copy-paste the entire `backend/db-setup-v2.sql` file.
4. Click **Go** to execute.
5. Verify: database `sampurna_erp` should appear with 12 tables.

> **WARNING**: The SQL script drops ALL existing tables. Run only once or when you want a fresh start.
