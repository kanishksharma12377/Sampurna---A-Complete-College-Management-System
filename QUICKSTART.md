# 🚀 Quick Start Guide

## Prerequisites
- AMPPS or XAMPP installed (you have AMPPS ✓)
- Node.js installed

## Setup in 5 Minutes

### Step 1: Start AMPPS Services
1. Open **AMPPS Control Panel**
2. Click **Start** for both "Apache" and "MySQL"

### Step 2: Create Database
1. Open browser: http://localhost/phpmyadmin (or http://localhost/ampps/phpmyadmin)
2. Click **SQL** tab at the top
3. Open the file `db-setup.sql` in a text editor
4. **Copy all contents** and paste into the SQL box
5. Click **Go** button

✅ Database `sampurna_erp` created with sample data!

### Step 2.5: Configure MySQL Password
Since you're using AMPPS, you may need to configure the password:

```bash
node find-mysql-password.js
```

This will automatically detect and configure your MySQL password!

### Step 3: Start the Application
Open terminal in project folder and run:
```bash
npm run dev
```

✅ Server running at http://localhost:3001

### Step 4: Login and Test

**Admin Login:**
- Go to: http://localhost:3001/login.html
- Select Role: Admin
- Username: `admin`
- Password: `admin123`

**Student Login:**
- Select Role: Student  
- Student ID: `STU001` (or STU002, STU003)
- Password: `student123`

## What You Can Do

### As Admin:
- View dashboard with statistics
- Add/manage students
- Add fee records
- Generate PDF receipts
- Post announcements

### As Student:
- View your profile
- Check fee payment history
- Download your receipts
- View announcements

## Need Help?
- Full setup guide: `MYSQL_SETUP.md`
- Migration details: `MIGRATION_SUMMARY.md`
- Troubleshooting: See MYSQL_SETUP.md

## Database Management
Access phpMyAdmin at: http://localhost/phpmyadmin
- View data in tables
- Add/edit records
- Backup/restore database

---
**That's it!** 🎉 Your ERP system is now running with MySQL!
