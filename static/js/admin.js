function initializeApp() {
    const adminContainer = document.getElementById('app-container');
    
    adminContainer.innerHTML = `
        <div class="admin-container">
            <div id="message-area"></div>
            <div id="login-section">
                <h2>ADMIN LOGIN</h2>
                <form id="admin-login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="admin-btn">Login</button>
                </form>
            </div>
            
            <div id="admin-panel" style="display: none;">
                <div class="admin-header">
                    <div class="user-greeting">Hello <span id="admin-username-display"></span></div>
                    <button id="logout-button" class="small-btn">Logout</button>
                </div>
                
                <p class="section-desc">Manage users and administrative access</p>
                
                <!-- User Management Section -->
                <h3>User Management</h3>
                
                <div class="user-actions">
                    <button id="show-add-user" class="action-btn">+ Add User</button>
                </div>
                
                <div id="add-user-form-container" style="display: none;" class="add-user-section">
                    <div class="form-inline">
                        <input type="text" id="new-username" placeholder="Username">
                        <input type="password" id="new-password" placeholder="Password">
                        <button id="add-user-btn" class="action-btn">Add</button>
                        <button id="cancel-add-user" class="action-btn">Cancel</button>
                    </div>
                </div>
                
                <div id="user-list" class="list-container">
                    <!-- User list will be populated here -->
                </div>
                
                <!-- Admin Management Section -->
                <h3>Admin Management</h3>
                
                <div class="admin-actions">
                    <button id="show-add-admin" class="action-btn">+ Add Admin</button>
                </div>
                
                <div id="add-admin-form-container" style="display: none;" class="add-admin-section">
                    <div class="form-inline">
                        <input type="text" id="admin-username" placeholder="Username">
                        <input type="password" id="admin-password" placeholder="Password">
                        <button id="add-admin-btn" class="action-btn">Add</button>
                        <button id="cancel-add-admin" class="action-btn">Cancel</button>
                    </div>
                </div>
                
                <div id="admin-list" class="list-container">
                    <!-- Admin list will be populated here -->
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .admin-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #fff;
        }
        
        .admin-container h2 {
            color: #501214;
            margin-top: 0;
            text-align: center;
        }
        
        .admin-container h3 {
            color: #501214;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        .section-desc {
            color: #666;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .user-greeting {
            font-size: 16px;
            font-weight: bold;
            color: #501214;
        }
        
        #admin-username-display {
            font-style: italic;
        }
        
        .admin-btn {
            background-color: #501214;
            color: white;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            width: 100%;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .small-btn {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 5px 10px;
            cursor: pointer;
        }
        
        .list-container {
            border: 1px solid #eee;
            padding: 10px;
            margin-bottom: 20px;
            max-height: 300px;
            overflow-y: auto;
            background-color: #fff;
        }
        
        .user-item, .admin-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #fff;
        }
        
        .user-item:last-child, .admin-item:last-child {
            border-bottom: none;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        
        input[type="text"], input[type="password"] {
            padding: 8px;
            border: 1px solid #ddd;
            box-sizing: border-box;
        }
        
        .action-btn {
            background: none;
            border: 1px solid #ddd;
            padding: 3px 8px;
            margin-left: 5px;
            cursor: pointer;
        }
        
        .user-actions, .admin-actions {
            margin-bottom: 10px;
        }
        
        .add-user-section, .add-admin-section {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #eee;
        }
        
        .form-inline {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .form-inline input {
            flex: 1;
            min-width: 0;
        }
        
        .message {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        
        .message.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .message.success {
            background-color: #d4edda;
            color: #155724;
        }
        
        @media (max-width: 600px) {
            .form-inline {
                flex-direction: column;
                align-items: stretch;
            }
            
            .action-btn {
                margin-left: 0;
                margin-top: 5px;
            }
        }
    `;
    document.head.appendChild(style);
    
    function showMessage(message, type = 'error') {
        const messageArea = document.getElementById('message-area');
        messageArea.innerHTML = `<div class="message ${type}">${message}</div>`;
        setTimeout(() => messageArea.innerHTML = '', 5000);
    }

    function updateAdminList(admins) {
        const adminList = document.getElementById('admin-list');
        adminList.innerHTML = '';
        
        if (admins.length === 0) {
            adminList.innerHTML = '<p style="text-align: center; color: #666;">No administrators found.</p>';
            return;
        }
        
        admins.forEach(admin => {
            const adminItem = document.createElement('div');
            adminItem.className = 'admin-item';
            adminItem.innerHTML = `
                <span>${admin[1]} ${admin[2] ? '<small>(Default Admin)</small>' : ''}</span>
                ${admin[2] ? '<span>Protected</span>' : `
                    <button onclick="removeAdmin(${admin[0]})" class="action-btn">Remove</button>
                `}
            `;
            adminList.appendChild(adminItem);
        });
    }

    async function updateUserList() {
        try {
            const adminResponse = await fetch('/admin-check');
            const adminData = await adminResponse.json();
            
            const adminUserIds = adminData.admin_user_ids || [];
            
            const response = await fetch('/admin/users');
            const data = await response.json();
            
            if (data.success) {
                const userList = document.getElementById('user-list');
                userList.innerHTML = '';
                
                const regularUsers = data.users.filter(user => !adminUserIds.includes(user.id));
                
                if (regularUsers.length === 0) {
                    userList.innerHTML = '<p style="text-align: center; color: #666;">No regular users found.</p>';
                    return;
                }
                
                regularUsers.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.className = 'user-item';
                    userItem.innerHTML = `
                      <span>${user.username}</span>
                      <div>
                          <button onclick="resetPassword(${user.id})" class="action-btn">Reset Password</button>
                          <button onclick="deleteUser(${user.id})" class="action-btn">Delete</button>
                      </div>
                    `;
                    userList.appendChild(userItem);
                });
            } else {
                console.error("User list did not return success:", data);
                showMessage('Failed to load users: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            showMessage('Failed to load users');
        }
    }


    
    async function handleLogin(event) {
        
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const username = formData.get("username");

        try {
            const response = await fetch('/admin', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                document.getElementById('admin-username-display').textContent = username;
                
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                updateAdminList(data.admins);
                updateUserList(); 
                showMessage('Login successful', 'success');
            } else {
                showMessage(data.message || 'Invalid credentials');
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.');
        }
    }

    async function handleAddUser() {
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        
        if (!username || !password) {
            showMessage('Username and password are required');
            return;
        }
        
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch('/admin/users/add', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                document.getElementById('new-username').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('add-user-form-container').style.display = 'none';
                document.getElementById('show-add-user').style.display = 'inline-block';
                updateUserList();
                showMessage(data.message || 'User added successfully', 'success');
            } else {
                showMessage(data.message || 'Failed to add user');
            }
        } catch (error) {
            showMessage('Failed to add user');
        }
    }

    // Handle adding new admin
    async function handleAddAdmin() {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        if (!username || !password) {
            showMessage('Username and password are required');
            return;
        }
        
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
    
        try {
            const response = await fetch('/admin/add', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
    
            if (data.success) {
                document.getElementById('admin-username').value = '';
                document.getElementById('admin-password').value = '';
                document.getElementById('add-admin-form-container').style.display = 'none';
                document.getElementById('show-add-admin').style.display = 'inline-block';
                updateAdminList(data.admins);
                showMessage(data.message || 'Admin added successfully', 'success');
            } else {
                showMessage(data.message || 'Failed to add admin');
            }
        } catch (error) {
            showMessage('Failed to add admin');
        }
    }
    

    // Handle removing admin
    window.removeAdmin = async function(adminId) {
        if (!confirm('Are you sure you want to remove this admin?')) return;

        try {
            const response = await fetch(`/admin/remove/${adminId}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                updateAdminList(data.admins);
                showMessage(data.message || 'Admin removed successfully', 'success');
            } else {
                showMessage(data.message || 'Failed to remove admin');
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.');
        }
    }

    // Handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/admin/logout', {
                method: 'POST',  
                headers: { 'Content-Type': 'application/json' }
            });
    
            const data = await response.json();
    
            if (data.success) {
                document.getElementById('login-section').style.display = 'block';
                document.getElementById('admin-panel').style.display = 'none';
                showMessage('Logged out successfully', 'success');
            } else {
                showMessage(data.message || 'Failed to logout');
            }
        } catch (error) {
            showMessage('Failed to logout');
        }
    }

    // Handle deleting user
    window.deleteUser = async function(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                showMessage(data.message || 'User deleted successfully', 'success');
                updateUserList();
            } else {
                showMessage(data.message || 'Failed to delete user');
            }
        } catch (error) {
            showMessage('Failed to delete user');
        }
    }

    // Handle password reset
    window.resetPassword = async function(userId) {
        const newPassword = prompt('Enter new password:');
        if (!newPassword) return;

        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('new_password', newPassword);

            const response = await fetch('/admin/users/reset-password', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                showMessage(data.message || 'Password reset successfully', 'success');
            } else {
                showMessage(data.message || 'Failed to reset password');
            }
        } catch (error) {
            showMessage('Failed to reset password');
        }
    }

    // Add event listeners for form submission
    document.getElementById('admin-login-form').addEventListener('submit', handleLogin);
    document.getElementById('add-user-btn').addEventListener('click', handleAddUser);
    document.getElementById('add-admin-btn').addEventListener('click', handleAddAdmin);
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // Toggle user form
    document.getElementById('show-add-user').addEventListener('click', function() {
        document.getElementById('add-user-form-container').style.display = 'block';
        this.style.display = 'none';
    });
    
    document.getElementById('cancel-add-user').addEventListener('click', function() {
        document.getElementById('add-user-form-container').style.display = 'none';
        document.getElementById('show-add-user').style.display = 'inline-block';
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
    });
    
    // Toggle admin form
    document.getElementById('show-add-admin').addEventListener('click', function() {
        document.getElementById('add-admin-form-container').style.display = 'block';
        this.style.display = 'none';
    });
    
    document.getElementById('cancel-add-admin').addEventListener('click', function() {
        document.getElementById('add-admin-form-container').style.display = 'none';
        document.getElementById('show-add-admin').style.display = 'inline-block';
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
    });

    // Check initial login status
    fetch('/admin-check')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                
                // Display the admin username from session
                document.getElementById('admin-username-display').textContent = data.admin_username || "admin";
                
                updateAdminList(data.admins);
                updateUserList();
            }
        })
        .catch(error => {
            console.error("Error checking login status:", error);
            showMessage('Failed to check login status');
        });
}

// Make initialization function available globally
window.initializeApp = initializeApp;