import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ExternalLink, Copy, Check } from 'lucide-react';

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedUsername, setCopiedUsername] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

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
            setError("Failed to load students. Please ensure you have HOD, Staff, or Admin permissions.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = (username) => {
        const url = `${window.location.origin}/student/${username}`;
        navigator.clipboard.writeText(url);
        setCopiedUsername(username);
        setTimeout(() => setCopiedUsername(null), 2000);
    };

    const filteredStudents = students.filter(student =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <h1>Student Directory</h1>
                        <p className="dashboard-subtitle">Manage and view individual dashboards for all {students.length} students</p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="dashboard-row">
                    <div className="premium-card" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                        {error}
                    </div>
                </div>
            )}

            <div className="dashboard-row">
                <div className="premium-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2>Directory Index</h2>
                        <div className="search-box" style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>

                    <div className="modern-table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>Department</th>
                                    <th>Last Login</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading student list...</td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            No students found matching "{searchTerm}".
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, idx) => (
                                        <tr key={idx}>
                                            <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{idx + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{student.username}</td>
                                            <td><span className="platform-tag">{student.department || 'AIML'}</span></td>
                                            <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {student.lastLogin === 'Never' ? 'Never' : new Date(student.lastLogin).toLocaleDateString()}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleCopyLink(student.username)}
                                                        className="btn-secondary"
                                                        style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        title="Copy Dashboard Link"
                                                    >
                                                        {copiedUsername === student.username ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Link</>}
                                                    </button>
                                                    <Link
                                                        to={`/student/${student.username}`}
                                                        className="view-details-link"
                                                        style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <ExternalLink size={14} /> Open
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
