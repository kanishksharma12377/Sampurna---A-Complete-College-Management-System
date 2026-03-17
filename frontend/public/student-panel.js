/* ===== Student Panel v3 — Sampurna ERP ===== */
(() => {
    /* ── Auth Guard ── */
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.username || user.role !== 'student') { window.location.href = '/login.html'; return; }

    const SID = user.username;                // e.g. SMPRNA-2025-0001
    const $  = id => document.getElementById(id);
    const API = url => fetch(url).then(r => r.json());
    const fmt = n  => '₹' + Number(n || 0).toLocaleString('en-IN');
    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

    let studentProfile = null;
    let feeRecords = [];

    /* ── Toast ── */
    function toast(msg, ok = true) {
        const t = $('toast');
        t.textContent = msg;
        t.className = 'toast ' + (ok ? 'toast-success' : 'toast-error');
        setTimeout(() => t.className = 'toast hidden', 3000);
    }

    /* ── Sidebar Navigation ── */
    const navBtns = document.querySelectorAll('.sidebar-nav-item');
    const sections = document.querySelectorAll('.section');
    const titles = { dashboard:'Dashboard', fees:'Fees', exams:'Exams', library:'Library', notices:'Notices' };

    function showSection(key) {
        navBtns.forEach(b => b.classList.toggle('active', b.dataset.section === key));
        sections.forEach(s => { s.classList.toggle('hidden', s.id !== 'sec-' + key); });
        $('sectionTitle').textContent = titles[key] || key;
        if (sectionLoaders[key]) sectionLoaders[key]();
    }
    navBtns.forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));

    /* Mobile toggle */
    $('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));

    /* ── Display student id ── */
    $('studentId').textContent = SID;

    /* ── Section Loaders ── */
    const sectionLoaders = {
        dashboard: loadDashboard,
        fees:      loadFees,
        exams:     loadExams,
        library:   loadLibrary,
        notices:   loadNotices
    };

    /* ── Load Dashboard ── */
    async function loadDashboard() {
        // Profile
        if (!studentProfile) {
            try {
                studentProfile = await API('/api/students/' + SID);
            } catch { toast('Could not load profile', false); return; }
        }
        const s = studentProfile;
        $('profileName').textContent       = s.name || '—';
        $('profileCourse').textContent     = s.course_year || '—';
        $('profileYear').textContent       = s.semester || '';
        $('profileSection').textContent    = s.section || 'A';
        $('profileRoll').textContent       = s.roll_no || s.student_id || '—';
        $('profileEmail').textContent      = s.email || '—';
        $('profilePhone').textContent      = s.phone || '—';
        $('profileGender').textContent     = s.gender || '—';
        $('profileDob').textContent        = fmtDate(s.dob);
        $('profileBlood').textContent      = s.blood_group || '—';
        $('profileFather').textContent     = s.fathers_name || '—';
        $('profileMother').textContent     = s.mothers_name || '—';
        $('profileCategory').textContent   = s.category || '—';
        $('profileReligion').textContent   = s.religion || '—';
        $('profileNationality').textContent = s.nationality || 'Indian';
        $('profileAadhar').textContent     = s.aadhar_no || '—';
        $('profileAddress').textContent    = s.address || '—';
        $('profilePermAddress').textContent = s.permanent_address || '—';

        // Fee total
        if (!feeRecords.length) {
            try { feeRecords = await API('/api/fee-records/' + SID); } catch {}
        }
        const totalPaid = feeRecords.reduce((s, r) => s + Number(r.total_amount || 0), 0);
        $('dashFeesPaid').textContent = fmt(totalPaid);

        // Upcoming exams count
        try {
            const exams = await API('/api/exams');
            const upcoming = exams.filter(e => new Date(e.exam_date) >= new Date());
            $('dashUpcomingExams').textContent = upcoming.length;
        } catch { $('dashUpcomingExams').textContent = '0'; }

        // Issued books count
        try {
            const resp = await fetch('/api/library/cards/' + SID);
            if (resp.ok) {
                const card = await resp.json();
                const mine = (card.issued_books || []).filter(b => !b.returned_at);
                $('dashIssuedBooks').textContent = mine.length;
            }
        } catch { $('dashIssuedBooks').textContent = '0'; }
    }

    /* ── Load Fees ── */
    async function loadFees() {
        try { feeRecords = await API('/api/fee-records/' + SID); } catch { feeRecords = []; }
        const total = feeRecords.reduce((s, r) => s + Number(r.total_amount || 0), 0);
        $('feesTotalPaid').textContent = fmt(total);
        $('feesCount').textContent = feeRecords.length;

        const tbody = $('feeHistoryBody');
        if (!feeRecords.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-6">No fee records found.</td></tr>';
            return;
        }
        tbody.innerHTML = feeRecords.map(r => {
            const amt = Number(r.total_amount || 0);
            const safe = JSON.stringify(r).replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `<tr>
                <td class="font-mono text-sm">${r.receipt_no}</td>
                <td>${fmtDate(r.date)}</td>
                <td class="font-semibold">${fmt(amt)}</td>
                <td>${r.payment_mode || '—'}</td>
                <td><button class="btn btn-primary btn-sm" onclick="downloadReceipt('${r.receipt_no}')"><i class="fa-solid fa-download mr-1"></i>Receipt</button></td>
            </tr>`;
        }).join('');
    }

    /* ── Load Exams ── */
    async function loadExams() {
        try {
            const exams = await API('/api/exams');
            const tbody = $('examTableBody');
            if (!exams.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-6">No exams scheduled.</td></tr>'; return; }

            // If we know student course, only show relevant + general
            const course = studentProfile ? studentProfile.course_year : null;
            const filtered = course ? exams.filter(e => !e.course || e.course.toLowerCase() === course.toLowerCase()) : exams;

            if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-6">No exams for your course.</td></tr>'; return; }

            tbody.innerHTML = filtered.map(e => {
                const upcoming = new Date(e.exam_date) >= new Date();
                const typeClass = e.exam_type === 'End-Semester' ? 'badge-red' : e.exam_type === 'Practical' ? 'badge-green' : 'badge-blue';
                return `<tr>
                    <td class="font-medium">${e.title}${upcoming ? ' <span class="badge badge-green">Upcoming</span>' : ''}</td>
                    <td>${e.course || '—'}</td>
                    <td><span class="badge ${typeClass}">${e.exam_type || 'Mid-Semester'}</span></td>
                    <td>${fmtDate(e.exam_date)}</td>
                    <td>${e.max_marks || 100}/${e.passing_marks || 40}</td>
                    <td>${e.venue || '—'}</td>
                </tr>`;
            }).join('');
        } catch { $('examTableBody').innerHTML = '<tr><td colspan="6" class="text-center text-red-400 py-6">Error loading exams.</td></tr>'; }
    }

    /* ── Load Library ── */
    async function loadLibrary() {
        // Check if student has a library card
        try {
            const resp = await fetch('/api/library/cards/' + SID);
            if (!resp.ok) { showNoCard(); loadAvailableBooks(); return; }
            const card = await resp.json();
            if (!card || !card.card_no) { showNoCard(); loadAvailableBooks(); return; }

            $('noCardAlert').classList.add('hidden');
            $('libCardInfo').classList.remove('hidden');
            $('myCardNo').textContent = card.card_no;
            $('myCardClass').textContent = card.class || card.class_name || '—';
            $('myCardRoll').textContent = card.roll_no || '—';

            // Issued books from card response
            const mine = (card.issued_books || []).filter(b => !b.returned_at);
            const container = $('myIssuedBooks');
            if (!mine.length) {
                container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-book block"></i><p>No books currently issued.</p></div>';
            } else {
                container.innerHTML = mine.map(b => `
                    <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2">
                        <div><p class="font-medium">${b.title || b.book_id}</p><p class="text-xs text-gray-500">Author: ${b.author || '—'} · Due: ${fmtDate(b.due_date)}</p></div>
                        <span class="badge badge-blue">Issued</span>
                    </div>
                `).join('');
            }
        } catch { showNoCard(); }

        loadAvailableBooks();
    }

    async function loadAvailableBooks() {
        try {
            const books = await API('/api/library/books');
            const avail = books.filter(b => b.available_copies > 0);
            const container = $('availableBooks');
            if (!avail.length) {
                container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-book-open block"></i><p>No books available.</p></div>';
            } else {
                container.innerHTML = avail.map(b => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div><p class="font-medium">${b.title}</p><p class="text-xs text-gray-500">${b.author || ''}</p></div>
                        <span class="badge badge-green">${b.available_copies} avail</span>
                    </div>
                `).join('');
            }
        } catch {}
    }

    function showNoCard() {
        $('noCardAlert').classList.remove('hidden');
        $('libCardInfo').classList.add('hidden');
    }

    /* ── Load Notices ── */
    async function loadNotices() {
        try {
            const notices = await API('/api/announcements');
            const container = $('noticeList');
            // Filter to "all" or "students" audience
            const relevant = notices.filter(n => !n.audience || n.audience === 'all' || n.audience === 'students');
            if (!relevant.length) {
                container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-bell-slash block"></i><p>No announcements yet.</p></div>';
                return;
            }
            container.innerHTML = relevant.map(n => {
                const priClass = n.priority === 'Urgent' ? 'badge-red' : n.priority === 'Important' ? 'badge-amber' : 'badge-blue';
                return `
                <div class="p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-2">
                            <h4 class="font-semibold text-gray-800">${n.title}</h4>
                            <span class="badge ${priClass}">${n.priority || 'Normal'}</span>
                        </div>
                        <span class="text-xs text-gray-400 whitespace-nowrap ml-4">${fmtDate(n.created_at)}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">${n.message}</p>
                    ${n.posted_by ? '<p class="text-xs text-gray-400 mt-1">— ' + n.posted_by + '</p>' : ''}
                </div>
            `}).join('');
        } catch { $('noticeList').innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation block"></i><p>Error loading notices.</p></div>'; }
    }

    /* ── Download Receipt ── */
    window.downloadReceipt = async function(receiptNo) {
        const record = feeRecords.find(r => r.receipt_no === receiptNo);
        if (!record) { toast('Record not found', false); return; }
        try {
            const pdfData = {
                receiptNo: record.receipt_no,
                studentId: record.student_id,
                studentName: record.student_name,
                courseYear: record.course_year,
                fees: record.fees || [{ name: 'Payment', amount: Number(record.total_amount) || 0 }],
                paymentMode: record.payment_mode,
                transactionId: record.transaction_id || '',
                remarks: record.remarks || '',
                date: record.date
            };
            const res = await fetch('/api/generate-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData)
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `Receipt_${receiptNo}.pdf`;
            document.body.appendChild(a); a.click();
            URL.revokeObjectURL(url); a.remove();
            toast('Receipt downloaded!');
        } catch { toast('Download failed', false); }
    };

    /* ── Logout ── */
    window.logout = function() {
        sessionStorage.removeItem('user');
        window.location.href = '/login.html';
    };

    /* ── Init ── */
    loadDashboard();
})();
