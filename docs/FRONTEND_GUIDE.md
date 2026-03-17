# Frontend Guide — Sampurna ERP v2

## Tech Stack
- **HTML5** — Semantic markup
- **Tailwind CSS** (CDN, no build) — Utility-first styling
- **CSS Custom Properties** (`styles.css`) — Design tokens, animations, components
- **Font Awesome 6.5.1** (CDN) — Icon system
- **Vanilla JavaScript** — No frameworks

---

## File Map

```
frontend/public/
├── index.html          Home/landing page
├── login.html          Login page (inline JS, no login.js)
├── login.js            [LEGACY — not used by new login.html]
├── admin-panel.html    Admin dashboard (sidebar layout, 8 sections)
├── admin-panel.js      Admin CRUD operations (~660 lines)
├── student-panel.html  Student portal (sidebar layout, 5 sections)
├── student-panel.js    Student data display (~220 lines)
├── styles.css          Global stylesheet (CSS vars, animations, components)
├── download-receipt.js [LEGACY — receipt logic now in panel JS files]
├── images/
│   ├── image.png       Logo (used in index.html)
│   ├── image2.png      Logo (used in panels)
│   └── README.txt      Placeholder info
```

---

## Design System (styles.css)

### CSS Variables
| Variable | Value | Usage |
|----------|-------|-------|
| `--maroon` | `#800000` | Primary brand color |
| `--green` | `#16a34a` | Success states |
| `--blue` | `#2563eb` | Info states |
| `--red` | `#dc2626` | Danger/error |
| `--amber` | `#d97706` | Warnings |
| `--sidebar-width` | `250px` | Fixed sidebar width |

### Component Classes
| Class | Purpose |
|-------|---------|
| `.sidebar` | Fixed left sidebar |
| `.sidebar-nav-item` | Nav button (`.active` state) |
| `.main-content` | Right content area (margin-left: sidebar-width) |
| `.topbar` | Sticky top header bar |
| `.stat-card` | Dashboard metric card with hover lift |
| `.card` | Generic white card with shadow |
| `.btn` / `.btn-primary` / `.btn-success` / `.btn-danger` | Button variants |
| `.btn-sm` / `.btn-outline` | Button modifiers |
| `.badge-green` / `.badge-red` / `.badge-blue` / `.badge-amber` | Status badges |
| `.toast` / `.toast-success` / `.toast-error` | Toast notifications |
| `.form-input` | Styled form input |
| `.modal-overlay` | Fullscreen modal backdrop |
| `.empty-state` | Empty data placeholder |
| `.spinner` | Loading spinner animation |

### Animations
| Name | Effect |
|------|--------|
| `fadeIn` | Opacity 0→1 |
| `slideInLeft` | Slide from -20px |
| `slideInRight` | Slide from +20px |
| `slideDown` | Slide from -10px |
| `pulse` | Scale 1→1.05→1 |
| `spin` | 360° rotation |

### Responsive
- At `768px`: sidebar hides (toggle with `.open`), main-content goes full-width, stat cards stack.

---

## Page Details

### login.html
- **Role tabs** (admin / student) instead of dropdown
- Admin: username + password fields
- Student: admission ID only (password hardcoded as `student123`)
- Password visibility toggle
- Hash preselect: `login.html#admin` or `login.html#student`
- Loading spinner on submit button
- Error display with icon
- All JS is inline (no external login.js needed)
- Stores `{ username, role }` in `sessionStorage` key `user`

### admin-panel.html + admin-panel.js
- **Auth guard**: Redirects to login if not admin role
- **Sidebar sections**: Dashboard, Admissions, Fees, Hostel, Exams, Library (3 sub-tabs), Departments, Notices
- **Lazy loading**: Each section loads data only when navigated to
- **Helper functions**: `API()`, `POST()`, `PUT()`, `DEL()`, `$()`, `fmt()`, `fmtDate()`, `toast()`
- **10 form handlers**: admission, fee (with dynamic rows), room, allocation, exam, book, library card, issue book, department, notice
- **Dashboard stats**: 8 metric cards from `/api/stats` + recent notices from `/api/announcements`
- **Receipt download**: Fetches PDF blob from `/api/generate-receipt`, triggers browser download
- **Student search**: Client-side filter on name/ID/course

### student-panel.html + student-panel.js
- **Auth guard**: Redirects to login if not student role
- **Sections**: Dashboard, Fees, Exams, Library, Notices
- **Dashboard**: Profile card + 3 stat cards (fees paid, books issued, upcoming exams)
- **Fees**: Total paid summary + fee history table + receipt download buttons
- **Exams**: Filtered by student's course (from profile), "Upcoming" badge on future exams
- **Library**: Library card info + issued books + available books catalog. Shows alert if no card.
- **Notices**: Filtered to `audience = 'all'` or `'students'`
- **IIFE pattern**: Wraps all code in immediately-invoked function

---

## Authentication Flow

```
login.html → POST /api/auth/login → sessionStorage('user')
    ↓ admin           ↓ student
admin-panel.html   student-panel.html
    ↓ checks role      ↓ checks role
  (redirect if wrong)
```

Logout: clears `sessionStorage` → redirect to `/login.html`

---

## Key Patterns

1. **Global fetch helpers** — `API(url)` for GET, `POST(url, body)` for mutations. Returns parsed JSON.
2. **DOM shortcuts** — `$(id)` instead of `document.getElementById`.
3. **Currency formatting** — `fmt(n)` → `'₹1,23,456'` (en-IN locale).
4. **Date formatting** — `fmtDate(d)` → `'15 Jan 2026'`.
5. **Toast notifications** — `toast(msg, isSuccess)` — auto-dismisses after 3s.
6. **Section loaders map** — `sectionLoaders = { dashboard: loadDashboard, ... }` — called on nav click.
