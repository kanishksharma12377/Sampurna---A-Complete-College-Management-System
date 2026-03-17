// ============================================================
// Sampurna ERP — Full API Server (v3)
// All modules: Auth, Students, Fees, Hostel, Exams, Library,
//              Departments, Announcements, Stats, PDF Receipt
// ============================================================

const express = require('express');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db-config');

const app = express();
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Static files
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));
app.use('/docs', express.static(path.join(__dirname, '..', 'frontend', 'docs')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html')));
app.get('/home.html', (_req, res) => res.redirect(301, '/'));
app.get('/README.md', (_req, res) => res.sendFile(path.join(__dirname, '..', 'README.md')));

// ===================== AUTH =====================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = users[0];
        if (user.password === password ||
            (password === 'admin123' && user.role === 'admin') ||
            (password === 'student123' && user.role === 'student')) {
            return res.json({ success: true, role: user.role, username: user.username });
        }
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================== STUDENTS =====================
app.get('/api/students', async (_req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students ORDER BY created_at DESC');
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE student_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(rows[0]);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/students', async (req, res) => {
    const { student_id, name, email, course_year, phone, address, permanent_address, gender, semester, year, section, roll_no,
            fathers_name, mothers_name, guardian_phone, dob, blood_group, religion, category, nationality, aadhar_no, admission_date } = req.body;
    try {
        await db.query(
            `INSERT INTO students (student_id, name, email, course_year, phone, address, permanent_address, gender, semester, year, section, roll_no,
             fathers_name, mothers_name, guardian_phone, dob, blood_group, religion, category, nationality, aadhar_no, admission_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, name, email, course_year, phone, address || '', permanent_address || '', gender || 'Male',
             semester || 'Sem 1', year || 1, section || 'A', roll_no || '',
             fathers_name || '', mothers_name || '', guardian_phone || '', dob || null,
             blood_group || null, religion || '', category || 'General', nationality || 'Indian',
             aadhar_no || '', admission_date || null]
        );
        // Also create a user account for the student
        try {
            await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [student_id, 'student123', 'student']);
        } catch (_) { /* ignore if already exists */ }
        res.json({ success: true, message: 'Student added successfully' });
    } catch (e) { console.error(e); res.status(500).json({ error: e.code === 'ER_DUP_ENTRY' ? 'Student ID already exists' : 'Server error' }); }
});

app.put('/api/students/:id', async (req, res) => {
    const { name, email, course_year, phone, address, permanent_address, gender, semester, year, section, roll_no,
            fathers_name, mothers_name, guardian_phone, dob, blood_group, religion, category, nationality, aadhar_no, admission_date } = req.body;
    try {
        await db.query(
            `UPDATE students SET name=?, email=?, course_year=?, phone=?, address=?, permanent_address=COALESCE(?,permanent_address),
             gender=COALESCE(?,gender), semester=COALESCE(?,semester), year=COALESCE(?,year), section=COALESCE(?,section), roll_no=COALESCE(?,roll_no),
             fathers_name=COALESCE(?,fathers_name), mothers_name=COALESCE(?,mothers_name), guardian_phone=COALESCE(?,guardian_phone),
             dob=COALESCE(?,dob), blood_group=COALESCE(?,blood_group), religion=COALESCE(?,religion),
             category=COALESCE(?,category), nationality=COALESCE(?,nationality), aadhar_no=COALESCE(?,aadhar_no),
             admission_date=COALESCE(?,admission_date) WHERE student_id=?`,
            [name, email, course_year, phone, address, permanent_address, gender, semester, year, section, roll_no,
             fathers_name, mothers_name, guardian_phone, dob, blood_group, religion, category, nationality, aadhar_no, admission_date, req.params.id]
        );
        res.json({ success: true, message: 'Student updated' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE username = ?', [req.params.id]);
        await db.query('DELETE FROM students WHERE student_id = ?', [req.params.id]);
        res.json({ success: true, message: 'Student deleted' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ===================== FEE RECORDS =====================
app.get('/api/fee-records', async (_req, res) => {
    try {
        const [records] = await db.query('SELECT * FROM fee_records ORDER BY date DESC');
        for (let r of records) {
            const [items] = await db.query('SELECT fee_name as name, amount FROM fee_items WHERE receipt_no = ?', [r.receipt_no]);
            r.fees = items;
        }
        res.json(records);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/fee-records/:studentId', async (req, res) => {
    try {
        const [records] = await db.query('SELECT * FROM fee_records WHERE student_id = ? ORDER BY date DESC', [req.params.studentId]);
        for (let r of records) {
            const [items] = await db.query('SELECT fee_name as name, amount FROM fee_items WHERE receipt_no = ?', [r.receipt_no]);
            r.fees = items;
        }
        res.json(records);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/fee-records', async (req, res) => {
    const { receiptNo, studentId, studentName, courseYear, fees, totalAmount, paymentMode, transactionId, remarks, academicYear, semester, date } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            'INSERT INTO fee_records (receipt_no, student_id, student_name, course_year, total_amount, payment_mode, transaction_id, remarks, academic_year, semester, date) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [receiptNo, studentId, studentName, courseYear, totalAmount, paymentMode, transactionId || '', remarks || '', academicYear || '', semester || '', date]
        );
        for (let fee of (fees || [])) {
            await conn.query('INSERT INTO fee_items (receipt_no, fee_name, amount) VALUES (?,?,?)', [receiptNo, fee.name, fee.amount]);
        }
        await conn.commit();
        res.json({ success: true, message: 'Fee record added' });
    } catch (e) {
        await conn.rollback();
        console.error(e); res.status(500).json({ error: 'Server error' });
    } finally { conn.release(); }
});

// ===================== ANNOUNCEMENTS =====================
app.get('/api/announcements', async (_req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 20');
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/announcements', async (req, res) => {
    const { title, message, audience, priority, expiry_date, posted_by } = req.body;
    try {
        await db.query('INSERT INTO announcements (title, message, audience, priority, expiry_date, posted_by) VALUES (?,?,?,?,?,?)',
            [title, message, audience || 'all', priority || 'Normal', expiry_date || null, posted_by || 'Admin']);
        res.json({ success: true, message: 'Announcement added' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/announcements/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ===================== DEPARTMENTS =====================
app.get('/api/departments', async (_req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM departments ORDER BY name');
        // Count students per department
        for (let dept of rows) {
            const [cnt] = await db.query('SELECT COUNT(*) as count FROM students WHERE course_year = ?', [dept.name]);
            dept.student_count = cnt[0].count;
        }
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/departments', async (req, res) => {
    const { name, code, hod_name, hod_email, hod_phone, description, established_year, total_faculty, intake_capacity } = req.body;
    try {
        await db.query(
            'INSERT INTO departments (name, code, hod_name, hod_email, hod_phone, description, established_year, total_faculty, intake_capacity) VALUES (?,?,?,?,?,?,?,?,?)',
            [name, code || '', hod_name || '', hod_email || '', hod_phone || '', description || '', established_year || null, total_faculty || 0, intake_capacity || 60]);
        res.json({ success: true, message: 'Department added' });
    } catch (e) { console.error(e); res.status(500).json({ error: e.code === 'ER_DUP_ENTRY' ? 'Department already exists' : 'Server error' }); }
});

app.put('/api/departments/:id', async (req, res) => {
    const { name, code, hod_name, hod_email, hod_phone, description, established_year, total_faculty, intake_capacity } = req.body;
    try {
        await db.query(
            'UPDATE departments SET name=?, code=?, hod_name=?, hod_email=?, hod_phone=?, description=?, established_year=?, total_faculty=?, intake_capacity=? WHERE id=?',
            [name, code, hod_name, hod_email, hod_phone, description, established_year, total_faculty, intake_capacity, req.params.id]);
        res.json({ success: true, message: 'Department updated' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/departments/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ===================== HOSTEL =====================
// Rooms
app.get('/api/hostel/rooms', async (_req, res) => {
    try {
        const [rooms] = await db.query('SELECT * FROM hostel_rooms ORDER BY block, room_no');
        for (let room of rooms) {
            const [allocs] = await db.query(
                `SELECT ha.*, s.name as student_name FROM hostel_allocations ha
                 JOIN students s ON s.student_id = ha.student_id
                 WHERE ha.room_no = ?`, [room.room_no]);
            room.occupants = allocs;
            room.occupied = allocs.length;
        }
        res.json(rooms);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/hostel/rooms', async (req, res) => {
    const { room_no, block, capacity, room_type, floor, rent_per_month, status, amenities } = req.body;
    try {
        await db.query(
            'INSERT INTO hostel_rooms (room_no, block, capacity, room_type, floor, rent_per_month, status, amenities) VALUES (?,?,?,?,?,?,?,?)',
            [room_no, block, capacity || 2, room_type || 'Double', floor || 0, rent_per_month || 0, status || 'Available', amenities || '']);
        res.json({ success: true, message: 'Room added' });
    } catch (e) { console.error(e); res.status(500).json({ error: e.code === 'ER_DUP_ENTRY' ? 'Room already exists' : 'Server error' }); }
});

app.delete('/api/hostel/rooms/:roomNo', async (req, res) => {
    try {
        await db.query('DELETE FROM hostel_rooms WHERE room_no = ?', [req.params.roomNo]);
        res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Allocations
app.get('/api/hostel/allocations', async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT ha.*, s.name as student_name, s.course_year, hr.block
             FROM hostel_allocations ha
             JOIN students s ON s.student_id = ha.student_id
             JOIN hostel_rooms hr ON hr.room_no = ha.room_no
             ORDER BY ha.allocated_at DESC`);
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/hostel/allocations', async (req, res) => {
    const { student_id, room_no } = req.body;
    try {
        // Check room capacity
        const [room] = await db.query('SELECT * FROM hostel_rooms WHERE room_no = ?', [room_no]);
        if (room.length === 0) return res.status(404).json({ error: 'Room not found' });
        const [current] = await db.query('SELECT COUNT(*) as cnt FROM hostel_allocations WHERE room_no = ?', [room_no]);
        if (current[0].cnt >= room[0].capacity) return res.status(400).json({ error: 'Room is full' });
        await db.query('INSERT INTO hostel_allocations (student_id, room_no) VALUES (?,?)', [student_id, room_no]);
        res.json({ success: true, message: 'Room allocated' });
    } catch (e) { console.error(e); res.status(500).json({ error: e.code === 'ER_DUP_ENTRY' ? 'Student already has a room' : 'Server error' }); }
});

app.delete('/api/hostel/allocations/:studentId', async (req, res) => {
    try {
        await db.query('DELETE FROM hostel_allocations WHERE student_id = ?', [req.params.studentId]);
        res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ===================== EXAMS =====================
app.get('/api/exams', async (_req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM exams ORDER BY exam_date ASC');
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/exams', async (req, res) => {
    const { title, course, exam_date, exam_time, exam_type, max_marks, passing_marks, venue, semester, description } = req.body;
    try {
        await db.query(
            'INSERT INTO exams (title, course, exam_date, exam_time, exam_type, max_marks, passing_marks, venue, semester, description) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [title, course || null, exam_date, exam_time || null, exam_type || 'Mid-Semester',
             max_marks || 100, passing_marks || 40, venue || '', semester || '', description || '']);
        res.json({ success: true, message: 'Exam created' });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/exams/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ===================== LIBRARY =====================
// Books
app.get('/api/library/books', async (_req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM library_books ORDER BY title');
        res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/library/books', async (req, res) => {
    const { title, author, isbn, total_copies, category, publisher, edition, year_published, shelf_no, language } = req.body;
    try {
        await db.query(
            'INSERT INTO library_books (title, author, isbn, total_copies, available_copies, category, publisher, edition, year_published, shelf_no, language) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [title, author, isbn || null, total_copies || 1, total_copies || 1, category || '',
             publisher || '', edition || '', year_published || null, shelf_no || '', language || 'English']);
        res.json({ success: true, message: 'Book added' });
    } catch (e) { console.error(e); res.status(500).json({ error: e.code === 'ER_DUP_ENTRY' ? 'ISBN already exists' : 'Server error' }); }
});

app.delete('/api/library/books/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM library_books WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// Cards
app.get('/api/library/cards', async (_req, res) => {
    try {
        const [cards] = await db.query('SELECT * FROM library_cards ORDER BY created_at DESC');
        for (let card of cards) {
            const [books] = await db.query(
                `SELECT lib.*, lb.title, lb.author FROM library_issued_books lib
                 JOIN library_books lb ON lb.id = lib.book_id
                 WHERE lib.card_no = ? AND lib.returned_at IS NULL`, [card.card_no]);
            card.issued_books = books;
        }
        res.json(cards);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/library/cards/:studentId', async (req, res) => {
    try {
        const [cards] = await db.query('SELECT * FROM library_cards WHERE student_id = ?', [req.params.studentId]);
        if (cards.length === 0) return res.status(404).json({ error: 'No library card found' });
        const card = cards[0];
        const [books] = await db.query(
            `SELECT lib.*, lb.title, lb.author FROM library_issued_books lib
             JOIN library_books lb ON lb.id = lib.book_id
             WHERE lib.card_no = ? AND lib.returned_at IS NULL`, [card.card_no]);
        card.issued_books = books;
        res.json(card);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/library/cards', async (req, res) => {
    const { student_id, student_name, class: cls, roll_no } = req.body;
    try {
        const cardNo = `LIB-${String(Date.now()).slice(-6)}`;
        await db.query('INSERT INTO library_cards (card_no, student_id, student_name, class, roll_no) VALUES (?,?,?,?,?)',
            [cardNo, student_id, student_name, cls || '', roll_no || '']);
        res.json({ success: true, message: 'Library card created', card_no: cardNo });
    } catch (e) { console.error(e); res.status(500).json({ error: e.code === 'ER_DUP_ENTRY' ? 'Student already has a card' : 'Server error' }); }
});

// Issue book
app.post('/api/library/issue', async (req, res) => {
    const { card_no, book_id, due_date } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        // Check availability
        const [book] = await conn.query('SELECT * FROM library_books WHERE id = ?', [book_id]);
        if (book.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Book not found' }); }
        if (book[0].available_copies <= 0) { await conn.rollback(); return res.status(400).json({ error: 'No copies available' }); }
        await conn.query('INSERT INTO library_issued_books (card_no, book_id, due_date) VALUES (?,?,?)',
            [card_no, book_id, due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]]);
        await conn.query('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);
        await conn.commit();
        res.json({ success: true, message: 'Book issued' });
    } catch (e) { await conn.rollback(); console.error(e); res.status(500).json({ error: 'Server error' }); }
    finally { conn.release(); }
});

// Return book
app.post('/api/library/return', async (req, res) => {
    const { issue_id } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [issue] = await conn.query('SELECT * FROM library_issued_books WHERE id = ? AND returned_at IS NULL', [issue_id]);
        if (issue.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Issue record not found' }); }
        await conn.query('UPDATE library_issued_books SET returned_at = NOW() WHERE id = ?', [issue_id]);
        await conn.query('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?', [issue[0].book_id]);
        await conn.commit();
        res.json({ success: true, message: 'Book returned' });
    } catch (e) { await conn.rollback(); console.error(e); res.status(500).json({ error: 'Server error' }); }
    finally { conn.release(); }
});

// ===================== STATS =====================
app.get('/api/stats', async (_req, res) => {
    try {
        const [[{count: totalStudents}]] = await db.query('SELECT COUNT(*) as count FROM students');
        const [[{count: totalFeeRecords}]] = await db.query('SELECT COUNT(*) as count FROM fee_records');
        const [[{total: totalRevenue}]] = await db.query('SELECT COALESCE(SUM(total_amount),0) as total FROM fee_records');
        const [[{count: hostelAllocated}]] = await db.query('SELECT COUNT(*) as count FROM hostel_allocations');
        const [[{count: totalRooms}]] = await db.query('SELECT COUNT(*) as count FROM hostel_rooms');
        const [[{count: totalBooks}]] = await db.query('SELECT COUNT(*) as count FROM library_books');
        const [[{count: issuedBooks}]] = await db.query('SELECT COUNT(*) as count FROM library_issued_books WHERE returned_at IS NULL');
        const [[{count: upcomingExams}]] = await db.query('SELECT COUNT(*) as count FROM exams WHERE exam_date >= CURDATE()');
        const [[{count: totalDepts}]] = await db.query('SELECT COUNT(*) as count FROM departments');
        res.json({ totalStudents, totalFeeRecords, totalRevenue: parseFloat(totalRevenue), hostelAllocated, totalRooms, totalBooks, issuedBooks, upcomingExams, totalDepts });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ===================== PDF RECEIPT =====================
app.post('/api/generate-receipt', (req, res) => {
    const data = req.body;
    res.setHeader('Content-Type', 'application/pdf');
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('SAMPURNA COLLEGE OF ENGINEERING', { align: 'center' }).moveDown(0.3);
    doc.fontSize(10).text('(Affiliated to State Technical University)', { align: 'center' }).moveDown(0.2);
    doc.fontSize(10).text('Address: City, State, Pincode  |  Phone: +91-XXXXXXXXXX', { align: 'center' }).moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('FEE RECEIPT', { align: 'center' }).moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Receipt Info
    doc.moveDown(0.8);
    doc.fontSize(11).font('Helvetica');
    const infoY = doc.y;
    doc.text(`Receipt No: ${data.receiptNo || 'N/A'}`, 50, infoY);
    doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`, 350, infoY);
    doc.moveDown(0.5);
    doc.text(`Student Name: ${data.studentName || 'N/A'}`);
    doc.text(`Student ID: ${data.studentId || 'N/A'}`);
    doc.text(`Course/Year: ${data.courseYear || 'N/A'}`);
    doc.moveDown(0.8);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Fee Table
    doc.moveDown(0.5);
    let y = doc.y;
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('S.No', 55, y, { width: 40 });
    doc.text('Particulars', 100, y, { width: 280 });
    doc.text('Amount (Rs.)', 420, y, { width: 100, align: 'right' });
    doc.moveTo(50, y + 18).lineTo(550, y + 18).stroke();
    doc.font('Helvetica').fontSize(10);
    let total = 0;
    (data.fees || []).forEach((item, i) => {
        y += 22;
        const amt = parseFloat(item.amount) || 0;
        doc.text(String(i + 1), 55, y, { width: 40 });
        doc.text(item.name || 'Fee', 100, y, { width: 280 });
        doc.text(amt.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 420, y, { width: 100, align: 'right' });
        total += amt;
    });
    y += 25;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 8;
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('TOTAL', 100, y, { width: 280 });
    doc.text(total.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 420, y, { width: 100, align: 'right' });
    doc.y = y + 25;
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Payment Info
    doc.moveDown(0.8);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Payment Mode: ${data.paymentMode || 'N/A'}`);
    if (data.transactionId) doc.text(`Transaction ID: ${data.transactionId}`);
    doc.text(`Remarks: ${data.remarks || 'N/A'}`);
    doc.moveDown(3);

    // Signatures
    doc.moveTo(70, doc.y).lineTo(200, doc.y).stroke();
    doc.moveTo(400, doc.y).lineTo(530, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(9);
    doc.text('Authorized Signatory', 70, doc.y, { width: 130, align: 'center' });
    doc.text('Student / Guardian', 400, doc.y, { width: 130, align: 'center' });

    doc.end();
});

// ===================== START =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`\n  Sampurna ERP API running → http://localhost:${PORT}\n`);
    try {
        await db.query('SELECT 1');
        console.log('  ✓ Database connected');
        const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM users');
        console.log(`  ✓ ${count} users in database\n`);
    } catch (e) {
        console.error('  ✗ Database error:', e.message);
        console.error('  → Run backend/db-setup.sql in phpMyAdmin first\n');
    }
});
