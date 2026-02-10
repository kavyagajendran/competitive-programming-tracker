

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });
    const [message, setMessage] = useState('');
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [announcements, setAnnouncements] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchContests();
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/announcements');
            if (res.ok) setAnnouncements(await res.json());
        } catch (e) { }
    };

    const fetchContests = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/contests');
            if (res.ok) {
                setContests(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch contests", e);
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        const url = editingId
            ? `http://localhost:5000/api/announcements/${editingId}`
            : 'http://localhost:5000/api/announcements';

        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...announcement,
                    author: 'Staff',
                    role: 'staff'
                })
            });
            if (res.ok) {
                setMessage(editingId ? 'Announcement updated!' : 'Announcement posted!');
                setAnnouncement({ title: '', content: '' });
                setEditingId(null);
                fetchAnnouncements();
            } else {
                setMessage('Failed to save announcement');
            }
        } catch (e) {
            setMessage('Network error');
        }
    };

    const handleEdit = (note) => {
        setAnnouncement({ title: note.title, content: note.content });
        setEditingId(note.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await fetch(`http://localhost:5000/api/announcements/${id}`, { method: 'DELETE' });
            fetchAnnouncements();
            setMessage('Announcement deleted');
        } catch (e) {
            setMessage('Failed to delete');
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1>Staff Dashboard</h1>
                <p className="subtitle">Manage Competitive Programming Tracking</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                {/* COLUMN 1: TRACKING & ANNOUNCEMENTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <h2>Tracking System</h2>
                        <p>
                            Access the automated tracking engine to monitor student performance across LeetCode, Codeforces, and CodeChef.
                        </p>
                        <div className="action-buttons" style={{ marginTop: '20px' }}>
                            <button
                                className="btn-primary"
                                style={{ padding: '15px 30px', fontSize: '1.2em' }}
                                onClick={() => navigate('/tracker')}
                            >
                                Launch Tracker
                            </button>
                        </div>
                    </div>

                    <div className="announcement-section card">
                        <h2>{editingId ? "Edit Announcement" : "Post New Announcement"}</h2>
                        {message && <p className="success-msg">{message}</p>}
                        <form onSubmit={handlePostAnnouncement}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={announcement.title}
                                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={announcement.content}
                                    onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                                    required
                                    rows="4"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary">{editingId ? "Update" : "Post"}</button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            setAnnouncement({ title: '', content: '' });
                                        }}
                                        style={{ background: '#666', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h2>Manage Announcements</h2>
                        {announcements.map(note => (
                            <div key={note.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{note.title}</strong>
                                    <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>{new Date(note.date).toLocaleDateString()}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleEdit(note)} style={{ cursor: 'pointer', color: 'blue', background: 'none', border: 'none' }}>Edit</button>
                                    <button onClick={() => handleDelete(note.id)} style={{ cursor: 'pointer', color: 'red', background: 'none', border: 'none' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMN 2: UPCOMING CONTESTS */}
                <div>
                    <div className="card">
                        <h2>Upcoming Contests</h2>
                        {loading ? <p>Loading contests...</p> : (
                            <div className="contest-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {contests.length === 0 ? <p>No upcoming contests found.</p> : contests.map((contest, idx) => (
                                    <div key={idx} className="contest-card" style={{
                                        marginBottom: '15px',
                                        padding: '15px',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        borderLeft: `5px solid ${getPlatformColor(contest.platform)}`,
                                        backgroundColor: '#fff'
                                    }}>
                                        <div className="contest-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold', color: getPlatformColor(contest.platform) }}>
                                                {contest.platform}
                                            </span>
                                            <span style={{ fontSize: '0.9em', color: '#666' }}>{new Date(contest.startTime).toLocaleString()}</span>
                                        </div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1em' }}>{contest.name}</h3>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.9em', color: '#555' }}>Duration: {Math.round(contest.duration / 60)} mins</p>
                                        <a href={contest.url} target="_blank" rel="noopener noreferrer" className="btn-small" style={{
                                            display: 'inline-block',
                                            padding: '5px 10px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#334155',
                                            textDecoration: 'none',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            fontSize: '0.85em'
                                        }}>Register / View</a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
