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

    const { csvContent, platform, sheetUrl, fields } = req.body;

    if (!csvContent || !platform || !sheetUrl) {
        return res.status(400).json({ message: 'Missing required fields: csvContent, platform, sheetUrl' });
    }

    log(`Starting tracking for Platform: ${platform}, Sheet: ${sheetUrl}`);
    if (fields) {
        log(`Selected fields: ${fields.join(', ')}`);
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

app.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
});
