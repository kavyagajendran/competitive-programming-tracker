
import { useState, useEffect } from 'react';

export default function StudentDashboard() {
    const [contests, setContests] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registeredContests, setRegisteredContests] = useState([]);
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contestRes, announceRes, regRes] = await Promise.all([
                fetch('http://localhost:5000/api/contests'),
                fetch('http://localhost:5000/api/announcements'),
                fetch('http://localhost:5000/api/user/registrations', {
                    headers: { 'x-user': username }
                })
            ]);

            if (contestRes.ok) setContests(await contestRes.json());
            if (announceRes.ok) setAnnouncements(await announceRes.json());
            if (regRes.ok) setRegisteredContests(await regRes.json());
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleRegistration = async (contestUrl) => {
        const isRegistered = registeredContests.includes(contestUrl);
        const action = isRegistered ? 'unregister' : 'register';

        // Optimistic UI update
        if (isRegistered) {
            setRegisteredContests(prev => prev.filter(url => url !== contestUrl));
        } else {
            setRegisteredContests(prev => [...prev, contestUrl]);
        }

        try {
            await fetch('http://localhost:5000/api/user/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, contestUrl, action })
            });
        } catch (e) {
            console.error("Failed to update registration", e);
            // Revert on failure
            fetchData();
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <h1>Student Dashboard</h1>

            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                {/* UPCOMING CONTESTS */}
                <div className="contests-section">
                    <h2>Upcoming Contests</h2>
                    {loading ? <p>Loading contests...</p> : (
                        <div className="contest-list">
                            {contests.length === 0 ? <p>No upcoming contests found.</p> : contests.map((contest, idx) => {
                                const isRegistered = registeredContests.includes(contest.url);
                                return (
                                    <div key={idx} className="contest-card card" style={{ marginBottom: '15px', borderLeft: `5px solid ${getPlatformColor(contest.platform)}` }}>
                                        <div className="contest-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className="platform-tag" style={{ fontWeight: 'bold', color: getPlatformColor(contest.platform) }}>
                                                {contest.platform}
                                            </span>
                                            <span className="contest-time">{new Date(contest.startTime).toLocaleString()}</span>
                                        </div>
                                        <h3>{contest.name}</h3>
                                        <p>Duration: {Math.round(contest.duration / 60)} mins</p>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                                            <a href={contest.url} target="_blank" rel="noopener noreferrer" className="btn-small">Register / View on Site</a>

                                            <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isRegistered}
                                                    onChange={() => toggleRegistration(contest.url)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span
                                                    className="slider"
                                                    style={{
                                                        position: 'absolute',
                                                        cursor: 'pointer',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: isRegistered ? '#28a745' : '#dc3545',
                                                        transition: '.4s',
                                                        borderRadius: '34px'
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            position: 'absolute',
                                                            content: '""',
                                                            height: '26px',
                                                            width: '26px',
                                                            left: isRegistered ? '30px' : '4px',
                                                            bottom: '4px',
                                                            backgroundColor: 'white',
                                                            transition: '.4s',
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                </span>
                                            </label>
                                            <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: isRegistered ? '#28a745' : '#dc3545' }}>
                                                {isRegistered ? 'Registered' : 'Not Registered'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ANNOUNCEMENTS */}
                <div className="announcements-sidebar">
                    <h2>Announcements</h2>
                    {announcements.length === 0 ? <p>No announcements yet.</p> : announcements.map(note => (
                        <div key={note.id} className="note-card card" style={{ marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
                            <h4>{note.title}</h4>
                            <p style={{ fontSize: '0.9em', color: '#555' }}>
                                By {note.author} • {new Date(note.date).toLocaleDateString()}
                            </p>
                            <p>{note.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getPlatformColor(platform) {
    switch (platform.toLowerCase()) {
        case 'leetcode': return '#ffa116';
        case 'codeforces': return '#1f8dd6';
        case 'codechef': return '#5b4638';
        default: return '#333';
    }
}
