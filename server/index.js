const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const USERS_FILE = path.join(__dirname, 'users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Helper to hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Ensure Admin Exists
function seedAdmin() {
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try {
            users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        } catch (e) { users = []; }
    }

    const adminUser = "Kavya@24";
    const adminPass = "123456789";

    if (!users.find(u => u.username === adminUser)) {
        users.push({
            id: Date.now(),
            username: adminUser,
            password: hashPassword(adminPass),
            role: 'admin',
            registeredContests: [],
            loginHistory: []
        });
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        console.log("Admin user seeded.");
    }
}
seedAdmin();

// Middleware to check Admin
function isAdmin(req, res, next) {
    // In real app use JWT verification. Here we trust the header/body logic for simplicity as requested.
    // We'll check the 'x-admin-user' header.
    const username = req.headers['x-admin-user'];
    if (username !== 'Kavya@24') { // Weak check for this specific project as designed
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
}

// Auth Routes

// LOGIN (Public)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            users = JSON.parse(data);
        } catch (e) { users = []; }
    }

    const userIndex = users.findIndex(u => u.username === username && u.password === hashPassword(password));
    if (userIndex === -1) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[userIndex];
    // Record login history
    if (!user.loginHistory) user.loginHistory = [];
    user.loginHistory.push(new Date().toISOString());
    users[userIndex] = user;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role || 'user' }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, username: user.username, role: user.role || 'user' });
});

// ADMIN: Create User
app.post('/api/admin/create-user', isAdmin, (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { users = []; }
    }

    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = {
        id: Date.now(),
        username,
        password: hashPassword(password),
        role: role || 'user',
        registeredContests: [],
        loginHistory: []
    };
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ message: 'User created successfully' });
});

// ADMIN: Delete User
app.delete('/api/admin/users/:username', isAdmin, (req, res) => {
    const targetUser = req.params.username;
    if (targetUser === 'Kavya@24') return res.status(400).json({ message: 'Cannot delete Super Admin' });

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { users = []; }
    }

    const initialLen = users.length;
    users = users.filter(u => u.username !== targetUser);

    if (users.length === initialLen) {
        return res.status(404).json({ message: 'User not found' });
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ message: 'User deleted successfully' });
});

// ADMIN: Update Role
app.patch('/api/admin/users/:username/role', isAdmin, (req, res) => {
    const targetUser = req.params.username;
    const { role } = req.body;
    if (targetUser === 'Kavya@24') return res.status(400).json({ message: 'Cannot demote Super Admin' });

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { users = []; }
    }

    const userIndex = users.findIndex(u => u.username === targetUser);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    users[userIndex].role = role;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ message: 'User role updated' });
});

// ADMIN STATS
app.get('/api/admin/users', (req, res) => {
    // Simple admin check via header (in a real app, verify JWT role)
    const isAdmin = req.headers['x-admin-user'] === 'Kavya@24';
    if (!isAdmin) {
        // Also check JWT just in case
        return res.status(403).json({ message: 'Access denied' });
    }

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try {
            users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        } catch (e) { users = []; }
    }

    // Return safe data
    const stats = users.map(u => ({
        username: u.username,
        role: u.role || 'user',
        totalLogins: u.loginHistory ? u.loginHistory.length : 0,
        lastLogin: u.loginHistory && u.loginHistory.length > 0
            ? u.loginHistory[u.loginHistory.length - 1]
            : 'Never',
        joinedAt: new Date(u.id).toISOString() // approximate for older users
    }));

    res.json(stats);
});

// Log file path
const LOG_FILE = path.join(__dirname, 'server.log');
const WORKER_SCRIPT = path.join(__dirname, '../worker/tracker.py');
// Python Interpreter Detection
const venvPathWindows = path.join(__dirname, '../.venv/Scripts/python.exe');
const venvPathUnix = path.join(__dirname, '../.venv/bin/python');
let PYTHON_CMD = 'python';

if (fs.existsSync(venvPathWindows)) {
    PYTHON_CMD = venvPathWindows;
} else if (fs.existsSync(venvPathUnix)) {
    PYTHON_CMD = venvPathUnix;
}

console.log(`Using Python Interpreter: ${PYTHON_CMD}`);


function log(message) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFile(LOG_FILE, logMsg, (err) => {
        if (err) console.error("Failed to write to log file");
    });
}

let isRunning = false;

// Trigger Sync/Track Endpoint
app.post('/api/track', (req, res) => {
    if (isRunning) {
        return res.status(409).json({ message: 'Tracking job already in progress' });
    }

    const { csvContent, platform, sheetUrl, fields, date } = req.body;

    if (!csvContent || !platform || !sheetUrl) {
        return res.status(400).json({ message: 'Missing required fields: csvContent, platform, sheetUrl' });
    }

    log(`Starting tracking for Platform: ${platform}, Sheet: ${sheetUrl}`);
    if (fields) {
        log(`Selected fields: ${fields.join(', ')}`);
    }
    if (date) {
        log(`Contest Date Filter: ${date}`);
    }
    isRunning = true;

    // Spawn Python Process
    // args: --csv <content> --is_content --platform <platform> --sheet <sheetUrl> --fields <field1,field2>
    const args = [
        WORKER_SCRIPT,
        '--csv', csvContent,
        '--is_content',
        '--platform', platform,
        '--sheet', sheetUrl
    ];

    if (fields && fields.length > 0) {
        args.push('--fields', fields.join(','));
    }

    if (date) {
        args.push('--date', date);
    }

    const process = spawn(PYTHON_CMD, args);

    process.stdout.on('data', (data) => {
        log(`Worker: ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
        log(`Worker Error: ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
        isRunning = false;
        log(`Worker finished with code ${code}`);
    });

    res.json({ message: 'Tracking started', status: 'running' });
});

// Status Endpoint
app.get('/api/status', (req, res) => {
    // Read last few lines of log
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        let logs = [];
        if (!err) {
            logs = data.split('\n').filter(l => l).slice(-50); // Last 50 lines
        }
        res.json({
            isRunning,
            logs
        });
    });
});

// Clear Logs Endpoint
app.post('/api/logs/clear', (req, res) => {
    if (isRunning) {
        return res.status(409).json({ message: 'Cannot clear logs while job is running' });
    }

    fs.writeFile(LOG_FILE, '', (err) => {
        if (err) {
            console.error("Failed to clear log file", err);
            return res.status(500).json({ message: 'Failed to clear logs' });
        }
        console.log("Logs cleared via API");
        res.json({ message: 'Logs cleared successfully' });
    });
});

// Scheduler (Optional: runs every day at midnight)
// Can be configured via env
// Scheduler (Optional: runs every day at midnight)
// Can be configured via env
if (process.env.ENABLE_Scheduler === 'true') {
    cron.schedule('0 0 * * *', () => {
        if (!isRunning) {
            log('Starting scheduled sync...');
            isRunning = true;
            const process = spawn(PYTHON_CMD, [WORKER_SCRIPT, "Tracking Data"]);
            process.on('close', (code) => {
                isRunning = false;
                log(`Scheduled worker finished with code ${code}`);
            });
        }
    });
}

// LeetCode Contest By Date Endpoint
app.post('/api/leetcode/contest', (req, res) => {
    const { username, date } = req.body;

    if (!username || !date) {
        return res.status(400).json({ message: 'Missing username or date' });
    }

    const scriptPath = path.join(__dirname, '../worker/fetch_contest.py');
    const args = [scriptPath, '--username', username, '--date', date];

    // Spawn separate process for this quick lookups
    const process = spawn(PYTHON_CMD, args);
    let outputData = '';
    let errorData = '';

    process.stdout.on('data', (data) => {
        outputData += data.toString();
    });

    process.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    process.on('close', (code) => {
        if (code !== 0) {
            // Try to parse error from stdout if it's JSON
            try {
                const json = JSON.parse(outputData);
                if (json.error) return res.status(404).json({ message: json.error });
            } catch (e) { }

            console.error("Fetch contest error:", errorData);
            return res.status(500).json({ message: 'Failed to fetch contest details', error: errorData });
        }

        try {
            const json = JSON.parse(outputData);
            res.json(json);
        } catch (e) {
            res.status(500).json({ message: 'Failed to parse worker response' });
        }
    });
});


// ... existing code ...

const CONTEST_SCRIPT = path.join(__dirname, '../worker/get_upcoming_contests.py');
const ANNOUNCEMENTS_FILE = path.join(__dirname, 'announcements.json');

// Get Upcoming Contests
app.get('/api/contests', (req, res) => {
    const process = spawn(PYTHON_CMD, [CONTEST_SCRIPT]);
    let outputData = '';
    let errorData = '';

    process.stdout.on('data', (data) => {
        outputData += data.toString();
    });

    process.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    process.on('close', (code) => {
        if (code !== 0) {
            console.error("Fetch contests error:", errorData);
            return res.status(500).json({ message: 'Failed to fetch contests', error: errorData });
        }
        try {
            const json = JSON.parse(outputData);
            res.json(json);
        } catch (e) {
            console.error("Parse error:", e, outputData);
            res.status(500).json({ message: 'Failed to parse contest data' });
        }
    });
});

// Announcements Endpoints
app.get('/api/announcements', (req, res) => {
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
        try {
            const data = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
            res.json(JSON.parse(data));
        } catch (e) {
            res.json([]);
        }
    } else {
        res.json([]);
    }
});

app.post('/api/announcements', (req, res) => {
    // Verified by JWT/Role in frontend, but here we should restrict to Admin/HOD/Staff ideally.
    // For now, open to authenticated users (could add middleware)
    const { title, content, author, role } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });

    let announcements = [];
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
        try {
            announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        } catch (e) { announcements = []; }
    }

    const newAnnouncement = {
        id: Date.now(),
        title,
        content,
        author: author || 'Staff',
        role: role || 'Staff',
        date: new Date().toISOString()
    };

    announcements.unshift(newAnnouncement); // Newest first
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
    res.json(newAnnouncement);
});

app.put('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    let announcements = [];
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
        try {
            announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        } catch (e) { announcements = []; }
    }

    const index = announcements.findIndex(a => a.id == id);
    if (index === -1) return res.status(404).json({ message: 'Announcement not found' });

    announcements[index] = { ...announcements[index], title, content };
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
    res.json(announcements[index]);
});

app.delete('/api/announcements/:id', (req, res) => {
    const { id } = req.params;

    let announcements = [];
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
        try {
            announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        } catch (e) { announcements = []; }
    }

    const initialLen = announcements.length;
    announcements = announcements.filter(a => a.id != id);

    if (announcements.length === initialLen) {
        return res.status(404).json({ message: 'Announcement not found' });
    }

    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
    res.json({ message: 'Announcement deleted' });
});

// HOD Stats Endpoint
app.get('/api/hod/stats', (req, res) => {
    // Read users.json for roles dist
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { }
    }

    const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
    }, {});

    // Read server log for activity
    let recentActivity = [];
    if (fs.existsSync(LOG_FILE)) {
        try {
            const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l);
            recentActivity = logs.slice(-10); // Last 10 lines
        } catch (e) { }
    }

    res.json({
        totalUsers: users.length,
        roleCounts,
        recentActivity
    });
});


// USER: Get Registrations
app.get('/api/user/registrations', (req, res) => {
    const username = req.headers['x-user']; // Simple auth for this project
    if (!username) return res.json([]);

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { }
    }

    const user = users.find(u => u.username === username);
    if (!user) return res.json([]);

    res.json(user.registeredContests || []);
});

// USER: Toggle Registration
app.post('/api/user/registrations', (req, res) => {
    const { username, contestUrl, action } = req.body;
    if (!username || !contestUrl) return res.status(400).json({ message: 'Missing data' });

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) { }
    }

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    let user = users[userIndex];
    if (!user.registeredContests) user.registeredContests = [];

    if (action === 'register') {
        if (!user.registeredContests.includes(contestUrl)) {
            user.registeredContests.push(contestUrl);
        }
    } else if (action === 'unregister') {
        user.registeredContests = user.registeredContests.filter(url => url !== contestUrl);
    }

    users[userIndex] = user;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({ message: 'Registration updated', registeredContests: user.registeredContests });
});

app.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
});
