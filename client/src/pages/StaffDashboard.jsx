import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Users, Megaphone, Plus, Trophy, ExternalLink, Trash2, Edit2, RefreshCw, Rocket, BarChart } from 'lucide-react';
import { fetchAllContests } from '../services/contestService';

export default function StaffDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [announcement, setAnnouncement] = useState({ title: '', content: '' });
    const [message, setMessage] = useState('');

    const [announcements, setAnnouncements] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [students, setStudents] = useState([]);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchAnnouncements(), fetchStudents(), fetchContests()]);
            setLoading(false);
        };
        loadAll();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/announcements', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-department-context': localStorage.getItem('department')
                }
            });
            if (res.ok) setAnnouncements(await res.json());
        } catch (e) { }
    };

    const fetchStats = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hod/dashboard-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-department-context': localStorage.getItem('department')
                }
            });
            if (!res.ok) throw new Error(`Stats error: ${res.status}`);
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch stats", e);
            setError("Failed to load statistics.");
        }
    };

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hod/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-department-context': localStorage.getItem('department')
                }
            });
            if (!res.ok) throw new Error(`Students error: ${res.status}`);
            const data = await res.json();
            setStudents(data);
        } catch (e) {
            console.error("Failed to fetch students", e);
            setError(prev => prev ? prev + " Failed to load students." : "Failed to load students.");
        }
    };

    const fetchContests = async () => {
        try {
            const data = await fetchAllContests();
            setContests(data);
        } catch (e) {
            console.error("Failed to fetch contests", e);
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        const url = editingId
            ? `/api/announcements/${editingId}`
            : '/api/announcements';

        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...announcement,
                    author: 'Staff',
                    role: 'staff',
                    department: localStorage.getItem('department')
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
            await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
            fetchAnnouncements();
            setMessage('Announcement deleted');
        } catch (e) {
            setMessage('Failed to delete');
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                        <Layout size={24} />
                    </div>
                    <div>
                        <h1>Staff Dashboard</h1>
                        <p className="dashboard-subtitle">Educational Management for {localStorage.getItem('department') || 'the'} Department</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                        onClick={() => navigate('/tracker')}
                        className="btn-primary"
                        style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Rocket size={18} /> Launch Tracker
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-secondary"
                        style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>
            </header>

            {error && (
                <div className="dashboard-row">
                    <div className="premium-card" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                        {error}
                    </div>
                </div>
            )}

            {/* STATS SECTION */}
            <div className="dashboard-row">
                <div className="premium-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart size={20} color="var(--primary)" />
                        <h2 style={{ margin: 0 }}>System Statistics</h2>
                    </div>
                    {stats ? (
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-label">Students</div>
                                <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.totalStudents}</div>
                                <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>Total in Department</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Active Today</div>
                                <div className="stat-value" style={{ color: '#10b981' }}>{stats.activeToday}</div>
                                <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>Student Logins</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Session Status</div>
                                <div className="stat-value" style={{ color: '#ef4444' }}>Authorized</div>
                                <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>Staff Access Active</div>
                            </div>
                        </div>
                    ) : <p>Loading statistics...</p>}
                </div>
            </div>

            <div className="dashboard-grid-2">
                {/* LEFT COLUMN: STUDENT LIST & CONTESTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card">
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} color="var(--primary)" />
                            <h2 style={{ margin: 0 }}>Department Students</h2>
                        </div>
                        <div className="modern-table-container">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Loading students...</td></tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                                No students found in this department.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 600 }}>{student.username}</td>
                                                <td><span className="platform-tag">{student.role}</span></td>
                                                <td>
                                                    <Link
                                                        to={`/student/${student.username}`}
                                                        className="view-details-link"
                                                        style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <ExternalLink size={14} /> View Dashboard
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* UPCOMING CONTESTS */}
                    <div className="premium-card">
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Trophy size={20} color="#fbbf24" />
                            <h2 style={{ margin: 0 }}>Upcoming Contests</h2>
                        </div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                            {loading ? (
                                <p style={{ textAlign: 'center', padding: '20px' }}>Loading contests...</p>
                            ) : contests.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No upcoming contests found.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {['LeetCode', 'Codeforces', 'CodeChef'].map(platform => {
                                        const platformContests = contests.filter(c => c.platform?.toLowerCase() === platform.toLowerCase());
                                        if (platformContests.length === 0) return null;
                                        return (
                                            <div key={platform} style={{ marginBottom: '1rem' }}>
                                                <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem', borderBottom: '1px solid #eef2ff', paddingBottom: '5px' }}>
                                                    {platform}
                                                </h3>
                                                {platformContests.map((contest, cIdx) => (
                                                    <div key={cIdx} className="announcement-item-new" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{contest.name}</h4>
                                                            <span className="platform-tag" style={{ fontSize: '0.7rem' }}>Upcoming</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
                                                            {new Date(contest.startTime).toLocaleString()}
                                                        </div>
                                                        <a
                                                            href={contest.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
                                                        >
                                                            <ExternalLink size={14} /> Register Details →
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ANNOUNCEMENT MANAGEMENT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* POST NEW */}
                    <div className="premium-card">
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Plus size={20} color="var(--primary)" />
                            <h2 style={{ margin: 0 }}>{editingId ? "Edit Announcement" : "Post Announcement"}</h2>
                        </div>
                        {message && (
                            <div style={{
                                padding: '10px',
                                background: message.includes('failed') ? '#fef2f2' : '#f0fdf4',
                                color: message.includes('failed') ? '#dc2626' : '#16a34a',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9em',
                                border: `1px solid ${message.includes('failed') ? '#fecaca' : '#bbf7d0'}`
                            }}>
                                {message}
                            </div>
                        )}
                        <form onSubmit={handlePostAnnouncement}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={announcement.title}
                                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                    required
                                    placeholder="Announcement Title"
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={announcement.content}
                                    onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                                    required
                                    rows="4"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical', fontFamily: 'inherit' }}
                                    placeholder="Write the content here..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {editingId ? <><Edit2 size={18} /> Update</> : <><Plus size={18} /> Post</>}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            setAnnouncement({ title: '', content: '' });
                                        }}
                                        className="btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* MANAGE EXISTING */}
                    <div className="premium-card">
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Megaphone size={20} color="var(--primary)" />
                            <h2 style={{ margin: 0 }}>Recent Announcements</h2>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
                            {announcements.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No announcements found.</p>
                            ) : (
                                announcements.map(note => (
                                    <div key={note.id} className="announcement-item-new" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <h4 className="announcement-title-new" style={{ fontSize: '1rem' }}>{note.title}</h4>
                                            <span className="announcement-author-text">
                                                {new Date(note.date).toLocaleDateString()} • {note.author}
                                            </span>
                                        </div>
                                        <p className="announcement-content-text" style={{ fontSize: '0.85em', marginBottom: '12px' }}>{note.content}</p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(note)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 10px', fontSize: '0.75em', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="btn-secondary"
                                                style={{ padding: '5px 10px', fontSize: '0.75em', flex: 1, color: '#ef4444', borderColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
