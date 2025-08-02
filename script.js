// Global Variables
let currentUser = null;
let issues = [];
let currentPage = 1;
let itemsPerPage = 6;
let filteredIssues = [];
let currentFilters = { category: 'all', status: 'all' };
let currentLocation = null;

// Initialize App
function initApp() {
    loadSampleData();
    checkAuthStatus();
    showPage('home');
    attachEventListeners();
}

// Load sample data
function loadSampleData() {
    const sampleIssues = [
        {
            id: 1,
            title: "Pothole on Main Street",
            description: "Large pothole causing damage to vehicles near the intersection of Main St and Oak Ave.",
            category: "infrastructure",
            status: "in-progress",
            reportedBy: "john@example.com",
            reportedDate: "2024-01-15",
            location: { lat: 40.7128, lng: -74.0060 },
            images: []
        },
        {
            id: 2,
            title: "Broken Streetlight",
            description: "Street light has been out for weeks, creating safety concerns for pedestrians at night.",
            category: "safety",
            status: "reported",
            reportedBy: "jane@example.com",
            reportedDate: "2024-01-20",
            location: { lat: 40.7589, lng: -73.9851 },
            images: []
        },
        {
            id: 3,
            title: "Illegal Dumping in Park",
            description: "Construction debris dumped illegally in Riverside Park, affecting the natural environment.",
            category: "environment",
            status: "pending",
            reportedBy: "bob@example.com",
            reportedDate: "2024-01-18",
            location: { lat: 40.7831, lng: -73.9712 },
            images: []
        },
        {
            id: 4,
            title: "Water Main Break",
            description: "Burst water pipe causing flooding on Elm Street, disrupting traffic and water service.",
            category: "utilities",
            status: "in-progress",
            reportedBy: "alice@example.com",
            reportedDate: "2024-01-22",
            location: { lat: 40.7505, lng: -73.9934 },
            images: []
        },
        {
            id: 5,
            title: "Damaged Playground Equipment",
            description: "Swing set at Central Park has broken chains, posing safety risk to children.",
            category: "safety",
            status: "resolved",
            reportedBy: "charlie@example.com",
            reportedDate: "2024-01-10",
            location: { lat: 40.7829, lng: -73.9654 },
            images: []
        },
        {
            id: 6,
            title: "Graffiti on Public Building",
            description: "Vandalism on the side of the community center building needs to be cleaned.",
            category: "infrastructure",
            status: "pending",
            reportedBy: "diana@example.com",
            reportedDate: "2024-01-25",
            location: { lat: 40.7614, lng: -73.9776 },
            images: []
        }
    ];

    // Load existing issues from storage or use sample data
    const storedIssues = JSON.parse(localStorage.getItem('civictrack_issues') || '[]');
    issues = storedIssues.length > 0 ? storedIssues : sampleIssues;
    
    // Save sample data if none exists
    if (storedIssues.length === 0) {
        localStorage.setItem('civictrack_issues', JSON.stringify(issues));
    }

    filteredIssues = [...issues];
}

// Simple hash function for password security (better than plain text)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Authentication
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('civictrack_user') || 'null');
    if (user) {
        currentUser = user;
        document.getElementById('loggedInMenu').classList.remove('hidden');
        document.getElementById('loggedOutMenu').classList.add('hidden');
        document.getElementById('userName').textContent = user.name;
    } else {
        document.getElementById('loggedInMenu').classList.add('hidden');
        document.getElementById('loggedOutMenu').classList.remove('hidden');
    }
}

// Enhanced login function
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('civictrack_users') || '[]');
    const hashedPassword = simpleHash(password);
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    
    if (user) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        
        // Update user in storage
        const userIndex = users.findIndex(u => u.email === email);
        users[userIndex] = user;
        localStorage.setItem('civictrack_users', JSON.stringify(users));
        
        // Set current user (remove password from memory)
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            registeredDate: user.registeredDate,
            lastLogin: user.lastLogin
        };
        
        localStorage.setItem('civictrack_user', JSON.stringify(currentUser));
        checkAuthStatus();
        showPage('home');
        
        console.log('User logged in:', currentUser.email);
        return true;
    }
    
    console.log('Login failed for:', email);
    return false;
}

// Enhanced registration function with validation
function register(userData) {
    const users = JSON.parse(localStorage.getItem('civictrack_users') || '[]');
    
    // Validate input data
    if (!userData.name || !userData.email || !userData.password) {
        return { success: false, message: 'All fields are required.' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }
    
    // Check password strength
    if (userData.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'User with this email already exists.' };
    }

    // Create user object with hashed password
    const newUser = {
        id: Date.now(), // Simple ID generation
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: simpleHash(userData.password), // Hash the password
        registeredDate: new Date().toISOString(),
        lastLogin: null
    };

    users.push(newUser);
    localStorage.setItem('civictrack_users', JSON.stringify(users));
    
    console.log('User registered successfully:', { email: newUser.email, id: newUser.id });
    return { success: true, message: 'Registration successful!' };
}

function logout() {
    currentUser = null;
    localStorage.removeItem('civictrack_user');
    checkAuthStatus();
    showPage('home');
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    // Load page-specific content
    switch (pageId) {
        case 'home':
            renderHomeIssues();
            break;
        case 'user-issues':
            if (!currentUser) {
                showPage('login');
                return;
            }
            renderUserIssues();
            break;
        case 'report-issue':
            if (!currentUser) {
                showPage('login');
                return;
            }
            break;
    }
}

// Issue Rendering
function renderHomeIssues() {
    const grid = document.getElementById('homeCardsGrid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentIssues = filteredIssues.slice(startIndex, endIndex);

    if (currentIssues.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">No issues found matching your criteria.</div>';
        document.getElementById('homePagination').innerHTML = '';
        return;
    }

    grid.innerHTML = currentIssues.map(issue => createIssueCard(issue)).join('');
    renderPagination('homePagination', filteredIssues.length);
}

function renderUserIssues() {
    if (!currentUser) return;
    
    const userIssues = issues.filter(issue => issue.reportedBy === currentUser.email);
    const grid = document.getElementById('userCardsGrid');
    
    if (userIssues.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">You haven\'t reported any issues yet.</div>';
        document.getElementById('userPagination').innerHTML = '';
        return;
    }

    grid.innerHTML = userIssues.map(issue => createIssueCard(issue)).join('');
    renderPagination('userPagination', userIssues.length);
}

function createIssueCard(issue) {
    return `
        <div class="card" onclick="showIssueDetails(${issue.id})">
            <div class="card-image">
                <span>${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)} Issue</span>
                <div class="status-badge status-${issue.status}">
                    ${formatStatus(issue.status)}
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${issue.title}</h3>
                <p class="card-description">${issue.description}</p>
                <small style="color: #9ca3af;">Reported: ${formatDate(issue.reportedDate)}</small>
            </div>
        </div>
    `;
}

function formatStatus(status) {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Pagination
function renderPagination(containerId, totalItems) {
    const container = document.getElementById(containerId);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ←
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-btn">...</span>`;
        }
    }

    html += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            →
        </button>
    `;

    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderHomeIssues();
}

// Filtering and Search
function applyFilters() {
    filteredIssues = issues.filter(issue => {
        const categoryMatch = currentFilters.category === 'all' || issue.category === currentFilters.category;
        const statusMatch = currentFilters.status === 'all' || issue.status === currentFilters.status;
        return categoryMatch && statusMatch;
    });

    const searchTerm = document.getElementById('homeSearchInput').value.toLowerCase();
    if (searchTerm) {
        filteredIssues = filteredIssues.filter(issue =>
            issue.title.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm)
        );
    }

    currentPage = 1;
    renderHomeIssues();
}

function searchIssues() {
    applyFilters();
}

function searchUserIssues() {
    renderUserIssues();
}

// Issue Details
function showIssueDetails(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const content = document.getElementById('issueDetailsContent');
    content.innerHTML = `
        <button class="btn btn-secondary" onclick="showPage('home')" style="margin-bottom: 2rem;">← Back to Issues</button>
        
        <div class="issue-image">
            <span>${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)} Issue Image</span>
        </div>

        <h1 style="margin-bottom: 1rem;">${issue.title}</h1>
        
        <div class="issue-meta">
            <div class="meta-item">
                <div class="meta-label">Status</div>
                <div class="meta-value">
                    <span class="status-badge status-${issue.status}">${formatStatus(issue.status)}</span>
                </div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Category</div>
                <div class="meta-value">${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Reported Date</div>
                <div class="meta-value">${formatDate(issue.reportedDate)}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Location</div>
                <div class="meta-value">Lat: ${issue.location.lat}, Lng: ${issue.location.lng}</div>
            </div>
        </div>

        <div style="margin: 2rem 0;">
            <h3>Description</h3>
            <p style="margin-top: 0.5rem; line-height: 1.6;">${issue.description}</p>
        </div>

        <div class="activity-log">
            <h3 style="margin-bottom: 1rem;">Activity Log</h3>
            <div class="activity-item">
                <strong>Issue Reported</strong>
                <p style="margin-top: 0.25rem; color: #6b7280;">Issue was reported on ${formatDate(issue.reportedDate)}</p>
            </div>
            ${issue.status !== 'reported' ? `
                <div class="activity-item">
                    <strong>Status Updated</strong>
                    <p style="margin-top: 0.25rem; color: #6b7280;">Status changed to ${formatStatus(issue.status)}</p>
                </div>
            ` : ''}
        </div>

        <button class="btn btn-primary" style="margin-top: 2rem;" onclick="reportUpdate(${issue.id})">
            Report an Update
        </button>
    `;

    showPage('issue-details');
}

function reportUpdate(issueId) {
    alert(`Update reporting functionality would be implemented here for issue #${issueId}`);
}

// Enhanced Form Handlers
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (login(email, password)) {
        alert('Login successful! Welcome back, ' + currentUser.name);
        // Clear form
        e.target.reset();
    } else {
        alert('Invalid credentials. Please check your email and password.');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const userData = {
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim().toLowerCase(),
        phone: document.getElementById('registerPhone').value.trim(),
        password: document.getElementById('registerPassword').value
    };

    const result = register(userData);
    
    if (result.success) {
        alert(result.message + ' Please login.');
        // Clear form
        e.target.reset();
        showPage('login');
    } else {
        alert(result.message);
    }
}

function handleReportIssue(e, formPrefix = '') {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to report an issue.');
        showPage('login');
        return;
    }

    const newIssue = {
        id: issues.length + 1,
        title: document.getElementById(formPrefix + 'issueTitle' || formPrefix + 'issuePageTitle').value,
        description: document.getElementById(formPrefix + 'issueDescription' || formPrefix + 'issuePageDescription').value,
        category: document.getElementById(formPrefix + 'issueCategory' || formPrefix + 'issuePageCategory').value,
        status: 'reported',
        reportedBy: currentUser.email,
        reportedDate: new Date().toISOString().split('T')[0],
        location: currentLocation || { lat: 40.7128, lng: -74.0060 },
        images: []
    };

    issues.push(newIssue);
    localStorage.setItem('civictrack_issues', JSON.stringify(issues));
    
    alert('Issue reported successfully!');
    
    // Reset form
    e.target.reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('pageImagePreview').innerHTML = '';
    
    // Redirect to user issues
    showPage('user-issues');
    renderUserIssues();
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    if (tabName === 'my-issues') {
        document.getElementById('my-issues-tab').classList.remove('hidden');
        document.getElementById('report-new-tab').classList.add('hidden');
        renderUserIssues();
    } else {
        document.getElementById('my-issues-tab').classList.add('hidden');
        document.getElementById('report-new-tab').classList.remove('hidden');
    }
}

// File Upload
function previewImages(input, containerId = 'imagePreview') {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Geolocation
function getLocation() {
    const status = document.getElementById('locationStatus');
    status.textContent = 'Getting location...';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                status.textContent = `Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
                status.style.color = '#059669';
            },
            function(error) {
                status.textContent = 'Unable to get location. Using default.';
                status.style.color = '#dc2626';
                currentLocation = { lat: 40.7128, lng: -74.0060 };
            }
        );
    } else {
        status.textContent = 'Geolocation not supported.';
        status.style.color = '#dc2626';
    }
}

function getLocationPage() {
    const status = document.getElementById('pageLocationStatus');
    status.textContent = 'Getting location...';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                status.textContent = `Location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
                status.style.color = '#059669';
            },
            function(error) {
                status.textContent = 'Unable to get location. Using default.';
                status.style.color = '#dc2626';
                currentLocation = { lat: 40.7128, lng: -74.0060 };
            }
        );
    } else {
        status.textContent = 'Geolocation not supported.';
        status.style.color = '#dc2626';
    }
}

// Utility Functions
function getAllUsers() {
    const users = JSON.parse(localStorage.getItem('civictrack_users') || '[]');
    return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        registeredDate: user.registeredDate,
        lastLogin: user.lastLogin
        // Password excluded for security
    }));
}

function exportUserData() {
    const users = getAllUsers();
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'civictrack_users_backup.json';
    link.click();
}

function clearAllUserData() {
    if (confirm('Are you sure you want to delete all user data? This cannot be undone.')) {
        localStorage.removeItem('civictrack_users');
        localStorage.removeItem('civictrack_user');
        currentUser = null;
        checkAuthStatus();
        alert('All user data has been cleared.');
    }
}

function viewStoredUsers() {
    const users = JSON.parse(localStorage.getItem('civictrack_users') || '[]');
    console.log('Stored users:', users);
    return users;
}

// Event Listeners
function attachEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Report issue forms
    document.getElementById('reportIssueForm').addEventListener('submit', (e) => handleReportIssue(e, ''));
    document.getElementById('reportIssuePageForm').addEventListener('submit', (e) => handleReportIssue(e, 'page'));
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            // Update active state
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            currentFilters[filterType.replace('user-', '')] = filterValue;
            applyFilters();
        });
    });

    // Search inputs
    document.getElementById('homeSearchInput').addEventListener('input', searchIssues);
    document.getElementById('userSearchInput').addEventListener('input', searchUserIssues);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', initApp);