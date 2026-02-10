
import { useState, useEffect } from 'react';

export default function HODDashboard() {
    const [stats, setStats] = useState(null);
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });
    const [message, setMessage] = useState('');

    const [announcements, setAnnouncements] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/announcements');
            if (res.ok) setAnnouncements(await res.json());
        } catch (e) { }
    };

    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/hod/stats', {
                headers: { 'x-admin-user': 'Kavya@24' } // Temporary auth bypass for demo logic or use token
            });
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch stats", e);
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
                    author: 'HOD',
                    role: 'hod'
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
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <h1>HOD Dashboard</h1>

            <div className="stats-section card" style={{ marginBottom: '20px' }}>
                <h2>System Statistics</h2>
                {stats ? (
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="stat-box">
                            <h3>Total Users</h3>
                            <p className="stat-number">{stats.totalUsers}</p>
                        </div>
                        <div className="stat-box">
                            <h3>Role Distribution</h3>
                            <ul>
                                {Object.entries(stats.roleCounts || {}).map(([role, count]) => (
                                    <li key={role}>{role}: {count}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : <p>Loading stats...</p>}
            </div>

            <div className="announcement-section card" style={{ marginBottom: '20px' }}>
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
    );
}
