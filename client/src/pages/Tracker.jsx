import { useState, useEffect } from 'react'

const PLATFORM_FIELDS = {
    'LeetCode': [
        'Global Ranking', 'Contest Ranking', 'Total Solved',
        'Easy', 'Medium', 'Hard', 'Contest Rating', 'Attended Contests',
        'Top Percentage'
    ],
    'CodeChef': [
        'Current Rating', 'Highest Rating', 'Star Rating',
        'Global Ranking', 'Country Ranking', 'Total Solved', 'Division'
    ],
    'Codeforces': [
        'Problems Solved', 'Current Rank', 'Current Rating',
        'Max. Rank', 'Max. Rating', 'Last Contest Rank', 'Last Contest Solved', 'Last Contest'
    ]
}

export default function Tracker() {
    const [status, setStatus] = useState({ isRunning: false, logs: [] })
    const [loading, setLoading] = useState(false)

    // Form State
    const [platform, setPlatform] = useState('LeetCode')
    const [sheetUrl, setSheetUrl] = useState('')
    const [csvFile, setCsvFile] = useState(null)

    // Initialize with all fields selected for the default platform
    const [selectedFields, setSelectedFields] = useState(new Set(PLATFORM_FIELDS['LeetCode']))

    // Contest Lookup State
    const [contestDate, setContestDate] = useState('')


    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/status')
            const data = await res.json()
            setStatus(data)
        } catch (error) {
            console.error("Failed to fetch status:", error)
        }
    }

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/status')
                const data = await res.json()

                if (!data.isRunning) {
                    await fetch('/api/logs/clear', { method: 'POST' })
                    setStatus({ isRunning: false, logs: [] })
                } else {
                    setStatus(data)
                }
            } catch (error) {
                console.error("Failed to initialize:", error)
            }
        }

        init()
        const interval = setInterval(fetchStatus, 2000)
        return () => clearInterval(interval)
    }, [])

    // Update selected fields when platform changes
    useEffect(() => {
        if (PLATFORM_FIELDS[platform]) {
            setSelectedFields(new Set(PLATFORM_FIELDS[platform]))
        }
    }, [platform])

    const handleFileChange = (e) => {
        if (e.target.files) {
            setCsvFile(e.target.files[0])
        }
    }

    const handleFieldToggle = (field) => {
        const next = new Set(selectedFields)
        if (next.has(field)) {
            next.delete(field)
        } else {
            next.add(field)
        }
        setSelectedFields(next)
    }

    const handleSync = async () => {
        if (!csvFile || !sheetUrl) {
            alert("Please provide both a CSV file and a Google Sheet Link.")
            return
        }

        if (selectedFields.size === 0) {
            alert("Please select at least one field to update.")
            return
        }

        setLoading(true)

        // Read CSV Content
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target.result

            try {
                const res = await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        csvContent: text,
                        platform,
                        sheetUrl,
                        fields: Array.from(selectedFields),
                        date: contestDate
                    })
                })

                if (res.ok) {
                    fetchStatus()
                } else {
                    const err = await res.json()
                    alert(`Error: ${err.message}`)
                }
            } catch (error) {
                console.error("Failed to start tracking:", error)
                alert("Network error starting tracker.")
            } finally {
                setLoading(false)
            }
        }

        reader.readAsText(csvFile)
    }



    return (
        <div className="tracker-page">
            <div className="card">
                <h2>Configuration</h2>

                <div className="form-group">
                    <label>Platform:</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                        <option value="LeetCode">LeetCode</option>
                        <option value="CodeChef">CodeChef</option>
                        <option value="Codeforces">Codeforces</option>
                    </select>
                </div>

                {/* Field Selection */}
                <div className="form-group">
                    <label>Fields to Update:</label>
                    <div className="checkbox-group">
                        {PLATFORM_FIELDS[platform].map(field => (
                            <label key={field}>
                                <input
                                    type="checkbox"
                                    checked={selectedFields.has(field)}
                                    onChange={() => handleFieldToggle(field)}
                                />
                                {field}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Upload CSV File (Profile Links):</label>
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                </div>

                <div className="form-group">
                    <label>Google Sheet Link / Name:</label>
                    <input
                        type="text"
                        placeholder="e.g. Tracking Data OR https://docs.google.com/..."
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                    />
                </div>

                {platform === 'LeetCode' && (
                    <div className="form-group">
                        <label>Contest Date (Optional):</label>
                        <input
                            type="date"
                            value={contestDate}
                            onChange={(e) => setContestDate(e.target.value)}
                            title="If selected, fetches specific contest stats for this date"
                        />
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            Updates 'Contest Title', 'Rank', etc. instead of global stats.
                        </small>
                    </div>
                )}

                <button
                    onClick={handleSync}
                    disabled={status.isRunning || loading}
                    className={status.isRunning ? 'btn-running' : 'btn-primary'}
                >
                    {status.isRunning ? 'Tracking in Progress...' : 'Start Tracking'}
                </button>
            </div>

            <div className="card">
                <h2>Live Logs</h2>
                <div className="logs-container">
                    {status.logs.length === 0 ? (
                        <p className="log-placeholder">Waiting for logs...</p>
                    ) : (
                        status.logs.map((log, i) => {
                            let className = "log-entry"
                            if (log.includes("Failed") || log.includes("Error")) className += " log-error"
                            else if (log.includes("Processing") || /\[\d+\/\d+\]/.test(log)) className += " log-process"
                            else if (log.includes("Success") || log.includes("Updated") || log.includes("Done")) className += " log-success"

                            // Highlight timestamp [YYYY-MM-DD HH:MM:SS]
                            const match = log.match(/^(\[.*?\])(.*)/)
                            if (match) {
                                return (
                                    <div key={i} className={className}>
                                        <span className="log-timestamp">{match[1]}</span>
                                        {match[2]}
                                    </div>
                                )
                            }
                            return <div key={i} className={className}>{log}</div>
                        })
                    )}
                    {status.isRunning && <div className="log-entry running">Worker is active...</div>}
                </div>
            </div>
        </div>
    )
}
