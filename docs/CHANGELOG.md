# Changelog — Sampurna ERP

## v2.0 (Current)

### Backend
- **New server.js** (499 lines) — Complete rewrite with 30+ API endpoints covering all modules.
- **New database schema** (`backend/db-setup-v2.sql`) — 12 tables with foreign keys, cascading deletions, and sample data.
- Modules: Auth, Students, Fees, Hostel, Exams, Library, Departments, Announcements, Stats, PDF Receipt.
- Transaction-safe fee collection and book issue/return with connection pooling.
- PDF receipt generation with PDFKit (signatures, fee table, payment info).

### Frontend
- **styles.css** — Full rewrite with CSS variables, keyframe animations, sidebar layout, stat cards, badge system, toast notifications, modals, responsive breakpoints.
- **login.html** — Role tabs (admin/student) instead of dropdown, password visibility toggle, loading spinner, hash preselect (#admin/#student). Inline JS, no login.js dependency.
- **admin-panel.html** — Sidebar navigation with 8 sections: Dashboard, Admissions, Fees, Hostel, Exams, Library (3 sub-tabs), Departments, Notices.
- **admin-panel.js** — ~660 lines handling all CRUD operations, sidebar nav, library sub-tabs, 10 form handlers, receipt download, live search.
- **student-panel.html** — Sidebar layout matching admin panel. 5 sections: Dashboard, Fees, Exams, Library, Notices.
- **student-panel.js** — ~220 lines. Auth guard, profile display, fee history with receipt download, exam schedule, library card + issued books, filtered announcements.

### Infrastructure
- Tailwind CSS via CDN (no build step).
- Font Awesome 6.5.1 icons.
- Express 5, MySQL2, PDFKit, body-parser.
- CORS middleware enabled.
- XAMPP MySQL (root/root, port 3306, database: sampurna_erp).

---

## v1.0 (Original)

### Bug Fixes Applied (13 bugs, 7 files)
1. **package.json** — Fixed `start` script path from `server.js` → `backend/server.js`.
2. **db-config.js** — Changed `authPlugins` to `authenticationMethod` (mysql2 fix).
3. **server.js** — CORS headers on all responses; fixed static file path; PDF receipt `toFixed()` on numbers; fixed redirect path.
4. **student-panel.js** — Fixed tab navigation DOM selectors (`[data-tab]` → `[id^="tab-"]`); added `defer` attribute; fixed `downloadReceipt` field mapping (snake_case → camelCase); fixed announcements element ID.
5. **admin-panel.js** — Added `parseFloat()` for fee totals.
6. **download-receipt.js** — Changed absolute URL to relative path.
7. **student-panel.html** — Fixed chatbot element ID reference.

### Original Features
- Basic admin panel with student management and fee collection.
- Student panel with profile, exams, library, chatbot stub, fees.
- MySQL backend with 3 tables (students, users, fee_records).
