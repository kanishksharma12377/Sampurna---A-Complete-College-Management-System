// Login functionality with MySQL backend

document.addEventListener('DOMContentLoaded', () => {
    const roleSelect = document.getElementById('role');
    const adminFields = document.getElementById('adminFields');
    const studentFields = document.getElementById('studentFields');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    roleSelect.addEventListener('change', () => {
        const role = roleSelect.value;
        if (role === 'admin') {
            adminFields.classList.remove('hidden');
            studentFields.classList.add('hidden');
        } else if (role === 'student') {
            adminFields.classList.add('hidden');
            studentFields.classList.remove('hidden');
        } else {
            adminFields.classList.add('hidden');
            studentFields.classList.add('hidden');
        }
        loginError.classList.add('hidden');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        const role = roleSelect.value;

        if (role === 'admin') {
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value.trim();
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.success && data.role === 'admin') {
                    sessionStorage.setItem('user', JSON.stringify({ username: data.username, role: 'admin' }));
                    window.location.href = 'admin-panel.html';
                } else {
                    loginError.textContent = 'Invalid admin credentials.';
                    loginError.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'Server error. Please try again.';
                loginError.classList.remove('hidden');
            }
        } else if (role === 'student') {
            const studentId = document.getElementById('studentId')?.value.trim();
            
            if (!studentId) {
                loginError.textContent = 'Please enter your Student ID.';
                loginError.classList.remove('hidden');
                return;
            }

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: studentId, password: 'student123' })
                });

                const data = await response.json();

                if (response.ok && data.success && data.role === 'student') {
                    sessionStorage.setItem('user', JSON.stringify({ username: studentId, role: 'student' }));
                    window.location.href = 'student-panel.html';
                } else {
                    loginError.textContent = 'Invalid student credentials.';
                    loginError.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'Server error. Please try again.';
                loginError.classList.remove('hidden');
            }
        } else {
            loginError.textContent = 'Please select a role.';
            loginError.classList.remove('hidden');
        }
    });
});
