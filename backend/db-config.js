// MySQL Database Configuration
const mysql = require('mysql2/promise');

// Database connection pool
// Try with both user configurations
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'sampurna_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on module load
pool.getConnection()
    .then(connection => {
        console.log('✓ MySQL connection pool created successfully');
        connection.release();
    })
    .catch(err => {
        console.error('✗ MySQL connection pool error:', err.message);
        console.error('\n  Quick Fix Options:');
        console.error('  1. In phpMyAdmin, go to SQL tab and run:');
        console.error('     ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'\';');
        console.error('     FLUSH PRIVILEGES;');
        console.error('\n  2. Or update db-config.js with password if you have one set');
    });

module.exports = pool;
