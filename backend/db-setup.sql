-- ============================================================
-- Sampurna ERP — Database Setup (v3)
-- All 12 tables with expanded fields and realistic sample data
-- ============================================================
-- Run this in phpMyAdmin (SQL tab) or MySQL CLI.
-- WARNING: This drops ALL existing tables. Use once for setup.
-- ============================================================

CREATE DATABASE IF NOT EXISTS sampurna_erp;
USE sampurna_erp;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS library_issued_books;
DROP TABLE IF EXISTS library_cards;
DROP TABLE IF EXISTS library_books;
DROP TABLE IF EXISTS hostel_allocations;
DROP TABLE IF EXISTS hostel_rooms;
DROP TABLE IF EXISTS fee_items;
DROP TABLE IF EXISTS fee_records;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ===================== USERS =====================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== STUDENTS =====================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    course_year VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT,
    permanent_address TEXT,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    semester VARCHAR(20) DEFAULT 'Sem 1',
    year INT DEFAULT 1,
    section VARCHAR(10) DEFAULT 'A',
    roll_no VARCHAR(50) DEFAULT NULL,
    fathers_name VARCHAR(255) DEFAULT NULL,
    mothers_name VARCHAR(255) DEFAULT NULL,
    guardian_phone VARCHAR(20) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
    religion VARCHAR(100) DEFAULT NULL,
    category ENUM('General','OBC','SC','ST','EWS') DEFAULT 'General',
    nationality VARCHAR(100) DEFAULT 'Indian',
    aadhar_no VARCHAR(20) DEFAULT NULL,
    admission_date DATE DEFAULT NULL,
    photo_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== DEPARTMENTS =====================
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    hod_name VARCHAR(255) DEFAULT NULL,
    hod_email VARCHAR(255) DEFAULT NULL,
    hod_phone VARCHAR(20) DEFAULT NULL,
    description TEXT,
    established_year INT DEFAULT NULL,
    total_faculty INT DEFAULT 0,
    intake_capacity INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== FEE RECORDS =====================
CREATE TABLE fee_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course_year VARCHAR(100) DEFAULT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT NULL,
    transaction_id VARCHAR(100) DEFAULT NULL,
    remarks TEXT,
    academic_year VARCHAR(20) DEFAULT NULL,
    semester VARCHAR(20) DEFAULT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== FEE ITEMS =====================
CREATE TABLE fee_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL,
    fee_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (receipt_no) REFERENCES fee_records(receipt_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== ANNOUNCEMENTS =====================
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    audience ENUM('all', 'students', 'hostel', 'library', 'exams') DEFAULT 'all',
    priority ENUM('Normal', 'Important', 'Urgent') DEFAULT 'Normal',
    expiry_date DATE DEFAULT NULL,
    posted_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== HOSTEL ROOMS =====================
CREATE TABLE hostel_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_no VARCHAR(20) NOT NULL UNIQUE,
    block VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    room_type ENUM('Single', 'Double', 'Triple') DEFAULT 'Double',
    floor INT DEFAULT 0,
    rent_per_month DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Available', 'Maintenance', 'Closed') DEFAULT 'Available',
    amenities VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== HOSTEL ALLOCATIONS =====================
CREATE TABLE hostel_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    room_no VARCHAR(20) NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (room_no) REFERENCES hostel_rooms(room_no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== EXAMS =====================
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME DEFAULT NULL,
    exam_type ENUM('Mid-Semester', 'End-Semester', 'Supplementary', 'Internal', 'Practical') DEFAULT 'Mid-Semester',
    max_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 40,
    venue VARCHAR(255) DEFAULT NULL,
    semester VARCHAR(20) DEFAULT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== LIBRARY BOOKS =====================
CREATE TABLE library_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) DEFAULT NULL UNIQUE,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    category VARCHAR(100) DEFAULT NULL,
    publisher VARCHAR(255) DEFAULT NULL,
    edition VARCHAR(50) DEFAULT NULL,
    year_published INT DEFAULT NULL,
    shelf_no VARCHAR(50) DEFAULT NULL,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== LIBRARY CARDS =====================
CREATE TABLE library_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_no VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    student_name VARCHAR(255) NOT NULL,
    class VARCHAR(100) DEFAULT NULL,
    roll_no VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ===================== LIBRARY ISSUED BOOKS =====================
CREATE TABLE library_issued_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_no VARCHAR(50) NOT NULL,
    book_id INT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (card_no) REFERENCES library_cards(card_no) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Admin + 7 Student users
INSERT INTO users (username, password, role, email) VALUES
('admin', 'admin123', 'admin', 'admin@sampurna.edu'),
('SMPRNA-0001-ABCD', 'student123', 'student', NULL),
('SMPRNA-0002-EFGH', 'student123', 'student', NULL),
('SMPRNA-0003-IJKL', 'student123', 'student', NULL),
('SMPRNA-0004-MNOP', 'student123', 'student', NULL),
('SMPRNA-0005-QRST', 'student123', 'student', NULL),
('SMPRNA-0006-UVWX', 'student123', 'student', NULL),
('SMPRNA-0007-YZAB', 'student123', 'student', NULL);

-- 6 Departments
INSERT INTO departments (name, code, hod_name, hod_email, hod_phone, description, established_year, total_faculty, intake_capacity) VALUES
('Computer Science & Engineering', 'CSE', 'Dr. Rajesh Kumar', 'rajesh@sampurna.edu', '9876500001',
 'Computer Science & Engineering department — AI, ML, Web, Systems', 2005, 18, 120),
('Mechanical Engineering', 'ME', 'Dr. Suresh Patil', 'suresh@sampurna.edu', '9876500002',
 'Mechanical Engineering — Design, Thermal, Manufacturing', 2005, 14, 60),
('Electrical Engineering', 'EE', 'Dr. Anita Desai', 'anita@sampurna.edu', '9876500003',
 'Electrical Engineering — Power Systems, Control, Electronics', 2008, 12, 60),
('Civil Engineering', 'CE', 'Dr. Vikram Singh', 'vikram@sampurna.edu', '9876500004',
 'Civil Engineering — Structures, Surveying, Environmental', 2008, 10, 60),
('Electronics & Communication', 'ECE', 'Dr. Meera Nair', 'meera@sampurna.edu', '9876500005',
 'ECE — VLSI, Signal Processing, Communication Systems', 2010, 11, 60),
('Information Technology', 'IT', 'Dr. Kiran Patel', 'kiran@sampurna.edu', '9876500006',
 'IT — Software Engineering, Networking, Cloud Computing', 2012, 9, 60);

-- 7 Students
INSERT INTO students (student_id, name, email, course_year, phone, address, permanent_address, gender, semester, year, section, roll_no,
                      fathers_name, mothers_name, guardian_phone, dob, blood_group, religion, category, nationality, aadhar_no, admission_date) VALUES
('SMPRNA-0001-ABCD', 'Rahul Sharma', 'rahul@example.com', 'Computer Science & Engineering', '9876543210',
 '123 MG Road, Sector 5, New Delhi 110001', '45 Gandhi Nagar, Jaipur, Rajasthan 302001',
 'Male', 'Sem 3', 2, 'A', 'CSE-23-001',
 'Ramesh Sharma', 'Sunita Sharma', '9876500010', '2004-05-15', 'B+', 'Hindu', 'General', 'Indian', '1234-5678-9012', '2023-08-01'),

('SMPRNA-0002-EFGH', 'Priya Singh', 'priya@example.com', 'Computer Science & Engineering', '9876543211',
 '45 Park Street, Andheri West, Mumbai 400058', '12 Civil Lines, Lucknow, UP 226001',
 'Female', 'Sem 3', 2, 'A', 'CSE-23-002',
 'Rajendra Singh', 'Kavita Singh', '9876500011', '2004-08-22', 'A+', 'Hindu', 'OBC', 'Indian', '2345-6789-0123', '2023-08-01'),

('SMPRNA-0003-IJKL', 'Amit Kumar', 'amit@example.com', 'Mechanical Engineering', '9876543212',
 '78 Lake Town, Salt Lake, Kolkata 700064', '23 Station Road, Patna, Bihar 800001',
 'Male', 'Sem 5', 3, 'B', 'ME-22-005',
 'Sunil Kumar', 'Rani Devi', '9876500012', '2003-11-01', 'O+', 'Hindu', 'SC', 'Indian', '3456-7890-1234', '2022-08-01'),

('SMPRNA-0004-MNOP', 'Sneha Reddy', 'sneha@example.com', 'Electrical Engineering', '9876543213',
 '12 Jubilee Hills, Road No. 36, Hyderabad 500033', '56 MG Road, Vijayawada, AP 520001',
 'Female', 'Sem 1', 1, 'A', 'EE-25-001',
 'Venkat Reddy', 'Lakshmi Reddy', '9876500013', '2005-02-10', 'AB+', 'Hindu', 'General', 'Indian', '4567-8901-2345', '2025-08-01'),

('SMPRNA-0005-QRST', 'Vikram Mehta', 'vikram@example.com', 'Civil Engineering', '9876543214',
 '56 Sector 17, Industrial Area, Chandigarh 160017', '89 Model Town, Ludhiana, Punjab 141002',
 'Male', 'Sem 7', 4, 'A', 'CE-21-003',
 'Arun Mehta', 'Pooja Mehta', '9876500014', '2002-09-30', 'A-', 'Hindu', 'General', 'Indian', '5678-9012-3456', '2021-08-01'),

('SMPRNA-0006-UVWX', 'Fatima Khan', 'fatima@example.com', 'Electronics & Communication', '9876543215',
 '34 Chowk Bazaar, Old City, Bhopal 462001', '78 Nawab Colony, Indore, MP 452001',
 'Female', 'Sem 3', 2, 'A', 'ECE-23-004',
 'Irfan Khan', 'Nasreen Khan', '9876500015', '2004-12-05', 'B-', 'Muslim', 'General', 'Indian', '6789-0123-4567', '2023-08-01'),

('SMPRNA-0007-YZAB', 'Arjun Nair', 'arjun@example.com', 'Information Technology', '9876543216',
 '90 MG Road, Ernakulam, Kochi 682001', '12 Beach Road, Trivandrum, Kerala 695001',
 'Male', 'Sem 5', 3, 'A', 'IT-22-002',
 'Suresh Nair', 'Deepa Nair', '9876500016', '2003-07-18', 'O-', 'Hindu', 'EWS', 'Indian', '7890-1234-5678', '2022-08-01');

-- 7 Hostel Rooms
INSERT INTO hostel_rooms (room_no, block, capacity, room_type, floor, rent_per_month, status, amenities) VALUES
('A-101', 'Block A', 2, 'Double',  1, 3000.00, 'Available',    'Fan, Study Table, Wardrobe'),
('A-102', 'Block A', 2, 'Double',  1, 3000.00, 'Available',    'Fan, Study Table, Wardrobe'),
('A-201', 'Block A', 1, 'Single',  2, 5000.00, 'Available',    'AC, Fan, Study Table, Wardrobe, Attached Bathroom'),
('A-202', 'Block A', 3, 'Triple',  2, 2500.00, 'Available',    'Fan, Study Table'),
('B-101', 'Block B', 2, 'Double',  1, 3500.00, 'Available',    'Fan, Study Table, Wardrobe, WiFi'),
('B-102', 'Block B', 2, 'Double',  1, 3500.00, 'Maintenance',  'Fan, Study Table, Wardrobe, WiFi'),
('B-201', 'Block B', 1, 'Single',  2, 5500.00, 'Available',    'AC, Fan, Study Table, Wardrobe, Attached Bathroom, WiFi');

-- 3 Hostel Allocations
INSERT INTO hostel_allocations (student_id, room_no) VALUES
('SMPRNA-0001-ABCD', 'A-101'),
('SMPRNA-0003-IJKL', 'B-101'),
('SMPRNA-0006-UVWX', 'A-201');

-- 7 Exams
INSERT INTO exams (title, course, exam_date, exam_time, exam_type, max_marks, passing_marks, venue, semester, description) VALUES
('Data Structures & Algorithms', 'Computer Science & Engineering', '2026-04-10', '10:00:00',
 'Mid-Semester', 60, 24, 'Hall A — Block 1', 'Sem 3', 'Arrays, Linked Lists, Stacks, Queues, Trees, Sorting'),
('Thermodynamics', 'Mechanical Engineering', '2026-04-12', '10:00:00',
 'Mid-Semester', 60, 24, 'Hall B — Block 2', 'Sem 5', 'Units 1-3: Laws of Thermodynamics, Entropy, Cycles'),
('Circuit Analysis', 'Electrical Engineering', '2026-05-15', '09:00:00',
 'End-Semester', 100, 40, 'Hall C — Block 1', 'Sem 1', 'Full syllabus — KVL, KCL, Thevenin, Norton, AC circuits'),
('Structural Analysis', 'Civil Engineering', '2026-04-14', '14:00:00',
 'Mid-Semester', 60, 24, 'Hall D — Block 3', 'Sem 7', 'Trusses, Beams, Frames, Influence Lines'),
('Database Management Systems Lab', 'Computer Science & Engineering', '2026-04-18', '14:00:00',
 'Practical', 50, 25, 'Computer Lab 3', 'Sem 3', 'SQL queries, ER diagrams, Normalization practicals'),
('Digital Electronics', 'Electronics & Communication', '2026-04-20', '10:00:00',
 'Mid-Semester', 60, 24, 'Hall A — Block 1', 'Sem 3', 'Boolean Algebra, K-maps, Flip-flops, Counters'),
('Strength of Materials (Viva)', 'Civil Engineering', '2026-04-25', '11:00:00',
 'Internal', 25, 10, 'CE Dept Staff Room', 'Sem 7', 'Oral viva on stress, strain, bending moment diagrams');

-- 10 Library Books
INSERT INTO library_books (title, author, isbn, total_copies, available_copies, category, publisher, edition, year_published, shelf_no, language) VALUES
('Introduction to Algorithms',      'Thomas H. Cormen',       '978-0262033848', 5, 4, 'Computer Science', 'MIT Press',            '3rd',  2009, 'CS-01',  'English'),
('Engineering Mechanics',           'R.S. Khurmi',            '978-8121925242', 3, 3, 'Mechanical',       'S. Chand Publishing',  '20th', 2018, 'ME-01',  'English'),
('Principles of Electric Circuits', 'Thomas L. Floyd',        '978-0132114677', 4, 4, 'Electrical',       'Pearson',              '9th',  2013, 'EE-01',  'English'),
('Design of Steel Structures',      'S.K. Duggal',            '978-0070260689', 2, 2, 'Civil',            'McGraw Hill',          '3rd',  2010, 'CE-01',  'English'),
('Database System Concepts',        'A. Silberschatz',        '978-0078022159', 3, 2, 'Computer Science', 'McGraw Hill',          '7th',  2019, 'CS-02',  'English'),
('Fluid Mechanics',                 'R.K. Bansal',            '978-8131808153', 4, 4, 'Mechanical',       'Laxmi Publications',   '10th', 2017, 'ME-02',  'English'),
('Operating System Concepts',       'Silberschatz, Galvin',   '978-1119800361', 3, 3, 'Computer Science', 'Wiley',                '10th', 2021, 'CS-03',  'English'),
('Signals and Systems',             'Alan V. Oppenheim',      '978-0138147570', 2, 2, 'Electronics',      'Pearson',              '2nd',  1996, 'ECE-01', 'English'),
('Computer Networks',               'Andrew S. Tanenbaum',    '978-0132126953', 3, 3, 'IT / Networking',  'Pearson',              '5th',  2010, 'IT-01',  'English'),
('Engineering Mathematics',         'B.S. Grewal',            '978-8174091956', 6, 6, 'Mathematics',      'Khanna Publishers',    '44th', 2020, 'GEN-01', 'English');

-- 3 Library Cards
INSERT INTO library_cards (card_no, student_id, student_name, class, roll_no) VALUES
('LIB-001', 'SMPRNA-0001-ABCD', 'Rahul Sharma', 'B.Tech CSE Sem 3', 'CSE-23-001'),
('LIB-002', 'SMPRNA-0002-EFGH', 'Priya Singh',  'B.Tech CSE Sem 3', 'CSE-23-002'),
('LIB-003', 'SMPRNA-0007-YZAB', 'Arjun Nair',   'B.Tech IT Sem 5',  'IT-22-002');

-- 3 Issued Books
INSERT INTO library_issued_books (card_no, book_id, due_date) VALUES
('LIB-001', 1, '2026-03-20'),
('LIB-002', 5, '2026-03-25'),
('LIB-003', 9, '2026-04-01');

-- 5 Fee Records
INSERT INTO fee_records (receipt_no, student_id, student_name, course_year, total_amount, payment_mode, transaction_id, remarks, academic_year, semester, date) VALUES
('REC-2026-001', 'SMPRNA-0001-ABCD', 'Rahul Sharma',  'Computer Science & Engineering',  75000.00, 'NEFT',   'NEFT-2026-00451', 'Sem 3 full payment',             '2025-26', 'Sem 3', '2026-01-15'),
('REC-2026-002', 'SMPRNA-0002-EFGH', 'Priya Singh',   'Computer Science & Engineering',  25000.00, 'UPI',    'UPI-PAY-2026-102','Partial payment — Tuition',       '2025-26', 'Sem 3', '2026-01-20'),
('REC-2026-003', 'SMPRNA-0003-IJKL', 'Amit Kumar',    'Mechanical Engineering',          68000.00, 'Cash',   '',                'Full payment with hostel',        '2025-26', 'Sem 5', '2026-02-01'),
('REC-2026-004', 'SMPRNA-0006-UVWX', 'Fatima Khan',   'Electronics & Communication',     72000.00, 'DD',     'DD-BOI-123456',   'Sem 3 full payment via DD',       '2025-26', 'Sem 3', '2026-01-10'),
('REC-2025-010', 'SMPRNA-0001-ABCD', 'Rahul Sharma',  'Computer Science & Engineering',  70000.00, 'Online', 'TXN-2025-00891',  'Sem 2 full payment',              '2024-25', 'Sem 2', '2025-07-20');

-- 21 Fee Items
INSERT INTO fee_items (receipt_no, fee_name, amount) VALUES
-- REC-2026-001 (Rahul — 6 items = 75k)
('REC-2026-001', 'Tuition Fee',          45000.00),
('REC-2026-001', 'Lab Fee',               8000.00),
('REC-2026-001', 'Library Fee',            3000.00),
('REC-2026-001', 'Exam Fee',              4000.00),
('REC-2026-001', 'Development Fee',       10000.00),
('REC-2026-001', 'Student Welfare Fund',   5000.00),
-- REC-2026-002 (Priya — 1 item = 25k)
('REC-2026-002', 'Tuition Fee',          25000.00),
-- REC-2026-003 (Amit — 4 items = 68k)
('REC-2026-003', 'Tuition Fee',          40000.00),
('REC-2026-003', 'Hostel Fee',           18000.00),
('REC-2026-003', 'Lab Fee',               5000.00),
('REC-2026-003', 'Exam Fee',              5000.00),
-- REC-2026-004 (Fatima — 5 items = 72k)
('REC-2026-004', 'Tuition Fee',          45000.00),
('REC-2026-004', 'Lab Fee',              10000.00),
('REC-2026-004', 'Library Fee',            3000.00),
('REC-2026-004', 'Development Fee',       10000.00),
('REC-2026-004', 'Student Welfare Fund',   4000.00),
-- REC-2025-010 (Rahul Sem 2 — 5 items = 70k)
('REC-2025-010', 'Tuition Fee',          45000.00),
('REC-2025-010', 'Lab Fee',               8000.00),
('REC-2025-010', 'Library Fee',            3000.00),
('REC-2025-010', 'Development Fee',       10000.00),
('REC-2025-010', 'Exam Fee',              4000.00);

-- 6 Announcements
INSERT INTO announcements (title, message, audience, priority, expiry_date, posted_by) VALUES
('Welcome to Spring Semester 2026',
 'Classes begin on March 3, 2026. All students must collect their ID cards from the admin office before March 5.',
 'all', 'Important', '2026-03-10', 'Dean Academics'),

('Library Timings Extended',
 'Library will remain open until 10 PM during exam season starting April 1. Extra reading rooms available on weekends.',
 'library', 'Normal', '2026-05-30', 'Chief Librarian'),

('Hostel Maintenance Notice',
 'Water supply will be interrupted on March 5 from 10 AM to 2 PM for annual tank cleaning. Please store water.',
 'hostel', 'Urgent', '2026-03-05', 'Hostel Warden'),

('Mid-Semester Exam Schedule Released',
 'Check the Exams section for your mid-semester exam dates and timings. Admit cards will be available from March 20.',
 'exams', 'Important', '2026-04-20', 'Exam Controller'),

('Anti-Ragging Committee Notice',
 'Ragging in any form is strictly prohibited. Report incidents to the committee at anti-ragging@sampurna.edu or call 1800-180-5522.',
 'students', 'Urgent', NULL, 'Dean Student Welfare'),

('Sports Day Registration Open',
 'Annual Sports Day is on April 28. Register for events at the PE department before April 15. Track, field, and indoor events available.',
 'all', 'Normal', '2026-04-15', 'Sports Director');

-- ============================================================
-- Setup complete! 12 tables, 8 users, 7 students, 6 depts,
-- 7 rooms, 7 exams, 10 books, 3 cards, 5 fee records,
-- 6 announcements.
-- ============================================================
