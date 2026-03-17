// ============================================================
// Sampurna ERP — Admin Panel JS (v3)
// Sidebar navigation, all CRUD for every module
// ============================================================

// ── Globals ──
let studentsCache = [];

// ── Auth guard ──
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
if (!user.username || user.role !== 'admin') { window.location.href = '/login.html'; }

// ── Helpers ──
const API = (path, opts) => fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());
const POST = (path, body) => API(path, { method: 'POST', body: JSON.stringify(body) });
const PUT  = (path, body) => API(path, { method: 'PUT',  body: JSON.stringify(body) });
const DEL  = (path)       => API(path, { method: 'DELETE' });
const $    = id => document.getElementById(id);
const fmt  = n  => '₹ ' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

function toast(msg, type = 'success') {
    const el = $('toast');
    el.textContent = msg;
    el.className = `toast toast-${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

function confirmAction(msg) { return window.confirm(msg); }

// ── Logout ──
function logout() { sessionStorage.removeItem('user'); window.location.href = '/login.html'; }

// ══════════ SIDEBAR NAVIGATION ══════════
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    const sections = document.querySelectorAll('.section');
    const titleMap = { dashboard:'Dashboard', admissions:'Admissions', fees:'Fee Management', hostel:'Hostel Management', exams:'Examinations', library:'Library', departments:'Departments', notices:'Notices' };

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const sec = btn.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.add('hidden'));
            const target = $('sec-' + sec);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('animate-fade-in');
            }
            $('sectionTitle').textContent = titleMap[sec] || sec;
            // Refresh data for section
            sectionLoaders[sec]?.();
        });
    });

    // Mobile menu toggle
    const toggle = $('menuToggle');
    const sidebar = $('sidebar');
    if (toggle) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // Library sub-tabs
    document.querySelectorAll('.lib-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.lib-tab').forEach(t => { t.classList.remove('btn-primary'); t.classList.add('btn-outline'); });
            tab.classList.add('btn-primary'); tab.classList.remove('btn-outline');
            document.querySelectorAll('.lib-panel').forEach(p => p.classList.add('hidden'));
            const target = { books:'libBooks', cards:'libCards', issued:'libIssued' }[tab.dataset.libtab];
            if (target) $(target).classList.remove('hidden');
        });
    });

    // Setup forms
    setupForms();
    // Initial load
    loadDashboard();
});

// ── Section loaders map ──
const sectionLoaders = {
    dashboard: loadDashboard,
    admissions: loadStudents,
    fees: loadFees,
    hostel: () => { loadRooms(); loadAllocations(); },
    exams: loadExams,
    library: () => { loadBooks(); loadCards(); loadIssued(); },
    departments: loadDepartments,
    notices: loadNotices,
};

// ══════════ DASHBOARD ══════════
async function loadDashboard() {
    try {
        const stats = await API('/api/stats');
        $('statStudents').textContent = stats.totalStudents || 0;
        $('statRevenue').textContent = fmt(stats.totalRevenue);
        $('statHostel').textContent = stats.hostelAllocated || 0;
        $('statBooks').textContent = stats.totalBooks || 0;
        $('statDepts').textContent = stats.totalDepts || 0;
        $('statExams').textContent = stats.upcomingExams || 0;
        $('statIssued').textContent = stats.issuedBooks || 0;
        $('statRooms').textContent = stats.totalRooms || 0;
    } catch (e) { console.error('Stats error:', e); }

    // Recent notices
    try {
        const notices = await API('/api/announcements');
        const container = $('dashNotices');
        if (!notices.length) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-bell-slash block"></i><p>No notices yet.</p></div>';
            return;
        }
        container.innerHTML = notices.slice(0, 5).map(n => {
            const priClass = n.priority === 'Urgent' ? 'badge-red' : n.priority === 'Important' ? 'badge-amber' : 'badge-blue';
            return `
            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div class="mt-1"><i class="fa-solid fa-circle-info text-maroon"></i></div>
                <div class="flex-1">
                    <div class="font-semibold text-gray-800">${n.title}</div>
                    <div class="text-sm text-gray-500 mt-1">${(n.message || '').substring(0, 120)}${(n.message?.length > 120) ? '…' : ''}</div>
                    <div class="text-xs text-gray-400 mt-1">${fmtDate(n.created_at)} · <span class="badge badge-blue">${n.audience || 'all'}</span> <span class="badge ${priClass}">${n.priority || 'Normal'}</span></div>
                </div>
            </div>
        `}).join('');
    } catch (e) { console.error(e); }
}

// ══════════ ADMISSIONS / STUDENTS ══════════
async function loadStudents() {
    try {
        studentsCache = await API('/api/students');
        renderStudentTable(studentsCache);
    } catch (e) { console.error(e); toast('Failed to load students', 'error'); }
}

function renderStudentTable(list) {
    const tbody = $('studentTableBody');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-400 py-6">No students found.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td><span class="font-mono text-xs badge badge-blue">${s.student_id}</span></td>
            <td class="font-medium">${s.name}</td>
            <td>${s.course_year || '—'}</td>
            <td>${s.roll_no || '—'}</td>
            <td>${s.semester || '—'}</td>
            <td>${s.phone || '—'}</td>
            <td class="flex gap-1">
                <button onclick="deleteStudent('${s.student_id}')" class="btn btn-danger btn-sm" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function deleteStudent(id) {
    if (!confirmAction(`Delete student ${id}? This cannot be undone.`)) return;
    try {
        await DEL(`/api/students/${id}`);
        toast('Student deleted');
        loadStudents();
    } catch (e) { toast('Delete failed', 'error'); }
}

// ══════════ FEES ══════════
async function loadFees() {
    try {
        const records = await API('/api/fee-records');
        const tbody = $('feeTableBody');
        if (!records.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-6">No fee records.</td></tr>';
            return;
        }
        tbody.innerHTML = records.map(r => `
            <tr>
                <td class="font-mono text-xs">${r.receipt_no}</td>
                <td>${r.student_name || r.student_id}</td>
                <td class="font-semibold text-green-700">${fmt(r.total_amount)}</td>
                <td>${fmtDate(r.date)}</td>
                <td><span class="badge badge-blue">${r.payment_mode || 'Cash'}</span></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); toast('Failed to load fees', 'error'); }
}

function addFeeRow() {
    const container = $('feeItemsContainer');
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-center mt-2';
    row.innerHTML = `
        <input class="form-input flex-1" placeholder="Fee type" />
        <input class="form-input w-28" type="number" placeholder="Amount" />
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500 text-lg font-bold" title="Remove"><i class="fa-solid fa-minus"></i></button>
    `;
    container.appendChild(row);
}

// ══════════ HOSTEL ══════════
async function loadRooms() {
    try {
        const rooms = await API('/api/hostel/rooms');
        const tbody = $('roomTableBody');
        if (!rooms.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-400 py-6">No rooms added.</td></tr>';
            return;
        }
        tbody.innerHTML = rooms.map(r => {
            const statusClass = r.status === 'Available' ? 'badge-green' : r.status === 'Maintenance' ? 'badge-amber' : 'badge-red';
            return `<tr>
                <td class="font-semibold">${r.room_no}</td>
                <td>${r.block || '—'}</td>
                <td>${r.room_type}</td>
                <td>${r.occupied || 0}/${r.capacity}</td>
                <td>₹${Number(r.rent_per_month || 0).toLocaleString('en-IN')}</td>
                <td><span class="badge ${statusClass}">${r.status || 'Available'}</span></td>
                <td><button onclick="deleteRoom('${r.room_no}')" class="btn btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        }).join('');
    } catch (e) { console.error(e); }
}

async function loadAllocations() {
    try {
        const allocs = await API('/api/hostel/allocations');
        const tbody = $('allocTableBody');
        if (!allocs.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-400 py-6">No allocations.</td></tr>';
            return;
        }
        tbody.innerHTML = allocs.map(a => `
            <tr>
                <td class="font-mono text-xs">${a.student_id}</td>
                <td class="font-semibold">${a.room_no}</td>
                <td>${fmtDate(a.allocated_date || a.created_at)}</td>
                <td><button onclick="deallocate('${a.student_id}')" class="btn btn-danger btn-sm" title="De-allocate"><i class="fa-solid fa-xmark"></i></button></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function deleteRoom(roomNo) {
    if (!confirmAction(`Delete room ${roomNo}?`)) return;
    try { await DEL(`/api/hostel/rooms/${roomNo}`); toast('Room deleted'); loadRooms(); }
    catch (e) { toast('Failed', 'error'); }
}

async function deallocate(studentId) {
    if (!confirmAction(`Remove hostel allocation for ${studentId}?`)) return;
    try { await DEL(`/api/hostel/allocations/${studentId}`); toast('De-allocated'); loadAllocations(); loadRooms(); }
    catch (e) { toast('Failed', 'error'); }
}

// ══════════ EXAMS ══════════
async function loadExams() {
    try {
        const exams = await API('/api/exams');
        const tbody = $('examTableBody');
        if (!exams.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-400 py-6">No exams scheduled.</td></tr>';
            return;
        }
        tbody.innerHTML = exams.map(e => {
            const isPast = new Date(e.exam_date) < new Date();
            const typeClass = e.exam_type === 'End-Semester' ? 'badge-red' : e.exam_type === 'Practical' ? 'badge-green' : 'badge-blue';
            return `<tr class="${isPast ? 'opacity-50' : ''}">
                <td class="font-medium">${e.title}</td>
                <td>${e.course || '—'}</td>
                <td><span class="badge ${typeClass}">${e.exam_type || 'Mid-Semester'}</span></td>
                <td>${fmtDate(e.exam_date)}</td>
                <td>${e.max_marks || 100}/${e.passing_marks || 40}</td>
                <td>${e.venue || '—'}</td>
                <td><button onclick="deleteExam(${e.id})" class="btn btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        }).join('');
    } catch (e) { console.error(e); }
}

async function deleteExam(id) {
    if (!confirmAction('Delete this exam?')) return;
    try { await DEL(`/api/exams/${id}`); toast('Exam deleted'); loadExams(); }
    catch (e) { toast('Failed', 'error'); }
}

// ══════════ LIBRARY ══════════
async function loadBooks() {
    try {
        const books = await API('/api/library/books');
        const tbody = $('bookTableBody');
        if (!books.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-6">No books in catalogue.</td></tr>';
            return;
        }
        tbody.innerHTML = books.map(b => `
            <tr>
                <td class="font-medium">${b.title}</td>
                <td>${b.author}</td>
                <td class="text-xs text-gray-500">${b.publisher || '—'}</td>
                <td class="text-xs">${b.shelf_no || '—'}</td>
                <td><span class="badge ${b.available_copies > 0 ? 'badge-green' : 'badge-red'}">${b.available_copies}/${b.total_copies}</span></td>
                <td><button onclick="deleteBook(${b.id})" class="btn btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function loadCards() {
    try {
        const cards = await API('/api/library/cards');
        const tbody = $('cardTableBody');
        if (!cards.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-6">No library cards.</td></tr>';
            return;
        }
        tbody.innerHTML = cards.map(c => `
            <tr>
                <td class="font-mono text-xs badge badge-blue">${c.card_no}</td>
                <td class="font-medium">${c.student_name}</td>
                <td>${c.class || '—'}</td>
                <td>${c.roll_no || '—'}</td>
                <td>${fmtDate(c.issued_on || c.created_at)}</td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function loadIssued() {
    try {
        const resp = await fetch('/api/library/cards');
        const allCards = await resp.json();
        // We need to aggregate issued books across all cards
        const tbody = $('issuedTableBody');
        let allIssued = [];
        for (const card of allCards) {
            if (card.issued_books && card.issued_books.length) {
                card.issued_books.forEach(ib => {
                    if (!ib.returned_at) {
                        allIssued.push({ ...ib, card_no: card.card_no });
                    }
                });
            }
        }
        if (!allIssued.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-6">No books currently issued.</td></tr>';
            return;
        }
        tbody.innerHTML = allIssued.map(ib => `
            <tr>
                <td>${ib.id}</td>
                <td class="font-mono text-xs">${ib.card_no}</td>
                <td>${ib.book_title || ib.book_id}</td>
                <td>${fmtDate(ib.issued_at)}</td>
                <td>${fmtDate(ib.due_date)}</td>
                <td><button onclick="returnBook(${ib.id})" class="btn btn-success btn-sm"><i class="fa-solid fa-rotate-left"></i> Return</button></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function deleteBook(id) {
    if (!confirmAction('Delete this book?')) return;
    try { await DEL(`/api/library/books/${id}`); toast('Book deleted'); loadBooks(); }
    catch (e) { toast('Failed', 'error'); }
}

async function returnBook(issueId) {
    try {
        await POST('/api/library/return', { issue_id: issueId });
        toast('Book returned');
        loadIssued();
        loadBooks();
    } catch (e) { toast('Return failed', 'error'); }
}

// ══════════ DEPARTMENTS ══════════
async function loadDepartments() {
    try {
        const depts = await API('/api/departments');
        const tbody = $('deptTableBody');
        if (!depts.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-6">No departments.</td></tr>';
            return;
        }
        tbody.innerHTML = depts.map(d => `
            <tr>
                <td><span class="badge badge-blue">${d.code || '—'}</span></td>
                <td class="font-medium">${d.name}</td>
                <td>${d.hod_name || '—'}</td>
                <td>${d.total_faculty || 0}</td>
                <td>${d.intake_capacity || 60}</td>
                <td><button onclick="deleteDept(${d.id})" class="btn btn-danger btn-sm"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function deleteDept(id) {
    if (!confirmAction('Delete this department?')) return;
    try { await DEL(`/api/departments/${id}`); toast('Department deleted'); loadDepartments(); }
    catch (e) { toast('Failed', 'error'); }
}

// ══════════ NOTICES ══════════
async function loadNotices() {
    try {
        const notices = await API('/api/announcements');
        const container = $('noticeList');
        if (!notices.length) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-bell-slash block"></i><p>No notices yet. Create one!</p></div>';
            return;
        }
        container.innerHTML = notices.map(n => {
            const priClass = n.priority === 'Urgent' ? 'badge-red' : n.priority === 'Important' ? 'badge-amber' : 'badge-blue';
            return `
            <div class="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div class="mt-1"><i class="fa-solid fa-bullhorn text-maroon"></i></div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-gray-800">${n.title}</span>
                        <span class="badge badge-blue">${n.audience || 'all'}</span>
                        <span class="badge ${priClass}">${n.priority || 'Normal'}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">${n.message || ''}</p>
                    <div class="text-xs text-gray-400 mt-2">${fmtDate(n.created_at)}${n.posted_by ? ' · ' + n.posted_by : ''}${n.expiry_date ? ' · Expires: ' + fmtDate(n.expiry_date) : ''}</div>
                </div>
                <button onclick="deleteNotice(${n.id})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
            </div>
        `}).join('');
    } catch (e) { console.error(e); }
}

async function deleteNotice(id) {
    if (!confirmAction('Delete this notice?')) return;
    try { await DEL(`/api/announcements/${id}`); toast('Notice deleted'); loadNotices(); }
    catch (e) { toast('Failed', 'error'); }
}

// ══════════ FORM HANDLERS ══════════
function setupForms() {
    // ── Admission ──
    $('admissionForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            name: $('admName').value.trim(),
            fathers_name: $('admFather').value.trim(),
            mothers_name: $('admMother').value.trim(),
            gender: $('admGender').value,
            dob: $('admDob').value,
            blood_group: $('admBloodGroup').value || null,
            category: $('admCategory').value,
            religion: $('admReligion').value.trim(),
            nationality: $('admNationality').value.trim() || 'Indian',
            aadhar_no: $('admAadhar').value.trim(),
            course_year: $('admCourse').value.trim(),
            year: parseInt($('admYear').value) || 1,
            semester: $('admSemester').value.trim(),
            section: $('admSection').value.trim() || 'A',
            roll_no: $('admRollNo').value.trim(),
            admission_date: $('admAdmissionDate').value || null,
            email: $('admEmail').value.trim(),
            phone: $('admPhone').value.trim(),
            guardian_phone: $('admGuardianPhone').value.trim(),
            address: $('admAddress').value.trim(),
            permanent_address: $('admPermAddress').value.trim(),
        };
        if (!body.name || !body.course_year || !body.year) { toast('Fill required fields', 'error'); return; }
        // Generate student_id
        const sid = 'SMPRNA-' + String(Date.now()).slice(-4) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        body.student_id = sid;
        try {
            const res = await POST('/api/students', body);
            if (res.success) {
                const resultEl = $('admResult');
                resultEl.innerHTML = `<div class="bg-green-50 text-green-800 p-3 rounded-lg"><i class="fa-solid fa-check-circle mr-1"></i>Student added! ID: <strong>${sid}</strong><br><small>Default password: student123</small></div>`;
                resultEl.classList.remove('hidden');
                e.target.reset();
                $('admNationality').value = 'Indian';
                $('admSection').value = 'A';
                $('admYear').value = '1';
                loadStudents();
            } else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Student search ──
    $('studentSearch')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = studentsCache.filter(s =>
            (s.name || '').toLowerCase().includes(q) ||
            (s.student_id || '').toLowerCase().includes(q) ||
            (s.course_year || '').toLowerCase().includes(q) ||
            (s.roll_no || '').toLowerCase().includes(q)
        );
        renderStudentTable(filtered);
    });

    // ── Fee form ──
    $('feeForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const rows = $('feeItemsContainer').querySelectorAll('.flex');
        const fees = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
                fees.push({ name: inputs[0].value, amount: parseFloat(inputs[1].value) });
            }
        });
        const total = fees.reduce((s, f) => s + f.amount, 0);
        const receiptNo = 'REC-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5);
        const body = {
            receiptNo,
            studentId: $('feeStudentId').value.trim(),
            studentName: $('feeStudentName').value.trim(),
            courseYear: $('feeCourseYear').value,
            totalAmount: total,
            paymentMode: $('feePaymentMode').value,
            transactionId: $('feeTransId').value.trim(),
            remarks: $('feeRemarks').value.trim(),
            date: new Date().toISOString().split('T')[0],
            fees,
        };
        if (!body.studentId || !body.studentName || total <= 0) { toast('Fill required fields & add fee amounts', 'error'); return; }
        try {
            const res = await POST('/api/fee-records', body);
            if (res.success) {
                toast('Fee recorded! Receipt: ' + receiptNo);
                downloadReceipt({ student_name: body.studentName, student_id: body.studentId, course_year: body.courseYear, fees, total_amount: total, payment_mode: body.paymentMode, transaction_id: body.transactionId, remarks: body.remarks }, receiptNo);
                e.target.reset();
                $('feeItemsContainer').innerHTML = `<div class="flex gap-2 items-center"><input class="form-input flex-1" placeholder="Fee type" value="Tuition Fee" /><input class="form-input w-28" type="number" placeholder="Amount" value="50000" /><button type="button" onclick="addFeeRow()" class="text-maroon text-lg font-bold" title="Add row"><i class="fa-solid fa-plus"></i></button></div>`;
                loadFees();
            } else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Room form ──
    $('roomForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            room_no: $('roomNo').value.trim(),
            block: $('roomBlock').value.trim(),
            room_type: $('roomType').value,
            capacity: parseInt($('roomCap').value) || 2,
            floor: parseInt($('roomFloor').value) || 0,
            rent_per_month: parseFloat($('roomRent').value) || 0,
            status: $('roomStatus').value,
            amenities: $('roomAmenities').value.trim()
        };
        if (!body.room_no || !body.block) { toast('Enter room number and block', 'error'); return; }
        try {
            const res = await POST('/api/hostel/rooms', body);
            if (res.success) { toast('Room added'); e.target.reset(); $('roomBlock').value = 'Block A'; $('roomCap').value = '2'; $('roomFloor').value = '1'; $('roomRent').value = '3000'; loadRooms(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Allocation form ──
    $('allocForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = { student_id: $('allocStudentId').value.trim(), room_no: $('allocRoom').value.trim() };
        if (!body.student_id || !body.room_no) { toast('Fill both fields', 'error'); return; }
        try {
            const res = await POST('/api/hostel/allocations', body);
            if (res.success) { toast('Allocated'); e.target.reset(); loadAllocations(); loadRooms(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Exam form ──
    $('examForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            title: $('examName').value.trim(),
            course: $('examCourse').value.trim(),
            exam_type: $('examType').value,
            exam_date: $('examDate').value,
            exam_time: $('examTime').value,
            max_marks: parseInt($('examMaxMarks').value) || 100,
            passing_marks: parseInt($('examPassMarks').value) || 40,
            venue: $('examVenue').value.trim(),
            semester: $('examSemester').value.trim(),
            description: $('examDesc').value.trim()
        };
        if (!body.title || !body.exam_date) { toast('Fill required fields', 'error'); return; }
        try {
            const res = await POST('/api/exams', body);
            if (res.success) { toast('Exam added'); e.target.reset(); $('examMaxMarks').value = '100'; $('examPassMarks').value = '40'; loadExams(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Book form ──
    $('bookForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            title: $('bookTitle').value.trim(),
            author: $('bookAuthor').value.trim(),
            isbn: $('bookISBN').value.trim(),
            publisher: $('bookPublisher').value.trim(),
            edition: $('bookEdition').value.trim(),
            year_published: parseInt($('bookYearPublished').value) || null,
            total_copies: parseInt($('bookCopies').value) || 1,
            category: $('bookCategory').value.trim(),
            shelf_no: $('bookShelfNo').value.trim(),
            language: $('bookLanguage').value
        };
        if (!body.title || !body.author) { toast('Fill required fields', 'error'); return; }
        try {
            const res = await POST('/api/library/books', body);
            if (res.success) { toast('Book added'); e.target.reset(); $('bookCopies').value = '1'; loadBooks(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Library card form ──
    $('cardForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            student_id: $('cardStudentId').value.trim(),
            student_name: $('cardStudentName').value.trim(),
            class: $('cardClass').value.trim(),
            roll_no: $('cardRollNo').value.trim()
        };
        if (!body.student_id || !body.student_name) { toast('Fill required fields', 'error'); return; }
        try {
            const res = await POST('/api/library/cards', body);
            if (res.success) { toast('Card created: ' + res.card_no); e.target.reset(); loadCards(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Issue book form ──
    $('issueForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            card_no: $('issueCardNo').value.trim(),
            book_id: parseInt($('issueBookId').value),
            due_date: $('issueDue').value || undefined
        };
        if (!body.card_no || !body.book_id) { toast('Fill required fields', 'error'); return; }
        try {
            const res = await POST('/api/library/issue', body);
            if (res.success) { toast('Book issued'); e.target.reset(); loadIssued(); loadBooks(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Department form ──
    $('deptForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            name: $('deptName').value.trim(),
            code: $('deptCode').value.trim(),
            hod_name: $('deptHOD').value.trim(),
            hod_email: $('deptHodEmail').value.trim(),
            hod_phone: $('deptHodPhone').value.trim(),
            established_year: parseInt($('deptEstYear').value) || null,
            total_faculty: parseInt($('deptFaculty').value) || 0,
            intake_capacity: parseInt($('deptIntake').value) || 60,
            description: $('deptDesc').value.trim()
        };
        if (!body.name || !body.code) { toast('Fill required fields', 'error'); return; }
        try {
            const res = await POST('/api/departments', body);
            if (res.success) { toast('Department added'); e.target.reset(); $('deptFaculty').value = '0'; $('deptIntake').value = '60'; loadDepartments(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });

    // ── Notice form ──
    $('noticeForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            title: $('noticeTitle').value.trim(),
            message: $('noticeContent').value.trim(),
            audience: $('noticeAudience').value,
            priority: $('noticePriority').value,
            expiry_date: $('noticeExpiry').value || null,
            posted_by: $('noticePostedBy').value.trim() || 'Admin'
        };
        if (!body.title || !body.message) { toast('Fill required fields', 'error'); return; }
        try {
            const res = await POST('/api/announcements', body);
            if (res.success) { toast('Notice posted'); e.target.reset(); $('noticePostedBy').value = 'Admin'; loadNotices(); }
            else { toast(res.error || 'Failed', 'error'); }
        } catch (err) { toast('Server error', 'error'); }
    });
}

// ── Receipt download helper ──
function downloadReceipt(data, receiptNo) {
    const payload = {
        receiptNo,
        date: new Date().toLocaleDateString(),
        studentName: data.student_name,
        studentId: data.student_id,
        courseYear: data.course_year || '',
        fees: data.fees || [{ name: 'Fee', amount: data.total_amount }],
        paymentMode: data.payment_mode || 'Cash',
        transactionId: data.transaction_id || '',
        remarks: data.remarks || ''
    };
    fetch('/api/generate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receiptNo}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    })
    .catch(() => toast('Receipt download failed', 'error'));
}
