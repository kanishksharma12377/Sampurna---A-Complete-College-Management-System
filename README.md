# Sampurna ERP

A full-stack college ERP web application with admin and student portals.

The project uses a Node.js + Express backend, a MySQL database, and a vanilla HTML/CSS/JavaScript frontend.

## Features

- Role-based login (Admin and Student)
- Student admission and profile management
- Fee records with item-wise breakdown
- PDF fee receipt generation
- Department management
- Hostel room and allocation management
- Exam scheduling
- Library module (books, cards, issue/return)
- Announcement/notice system
- Dashboard stats for quick insights

## Tech Stack

- Backend: Node.js, Express 5, body-parser, PDFKit
- Database: MySQL (mysql2)
- Frontend: HTML, Tailwind CSS (CDN), vanilla JavaScript

## Project Structure

```text
.
|- backend/
|  |- db-config.js
|  |- db-setup.sql
|  |- server.js
|- frontend/
|  |- docs/
|  |- public/
|- docs/
|- package.json
|- QUICKSTART.md
```

## Prerequisites

- Node.js 18+
- MySQL server (XAMPP, AMPPS, or standalone MySQL)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create database and seed sample data:

- Open phpMyAdmin (or MySQL CLI)
- Run the SQL script in backend/db-setup.sql

3. Verify database connection settings in backend/db-config.js:

- host: localhost
- port: 3306
- user: root
- password: root (change if your local setup differs)
- database: sampurna_erp

4. Start the server:

```bash
npm run dev
```

5. Open in browser:

- Home: http://localhost:3001/
- Login: http://localhost:3001/login.html
- Admin Panel: http://localhost:3001/admin-panel.html
- Student Panel: http://localhost:3001/student-panel.html

## Demo Credentials

- Admin
	- Username: admin
	- Password: admin123

- Student (sample)
	- Username: SMPRNA-0001-ABCD
	- Password: student123

## NPM Scripts

- npm run dev
- npm start

Both scripts run backend/server.js.

## API and Documentation

- API reference: docs/API_REFERENCE.md
- Database schema: docs/DB_SCHEMA.md
- Frontend guide: docs/FRONTEND_GUIDE.md
- Changelog: docs/CHANGELOG.md
- Upgrade plan: docs/UPGRADE_PLAN.md

## Notes

- Static frontend is served from frontend/public.
- The backend currently allows CORS for all origins (development friendly).
- Authentication uses plain text passwords in sample data; use hashing for production.
