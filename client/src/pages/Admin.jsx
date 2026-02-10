import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Form State
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'student' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const navigate = useNavigate();
    const currentAdmin = localStorage.getItem('username');

    // Verify Admin Access
    useEffect(() => {
        if (!currentAdmin || currentAdmin.toLowerCase() !== 'kavya@24') {
            navigate('/');
            return;
        }
        fetchStats();
    }, [navigate, currentAdmin]);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'x-admin-user': 'Kavya@24' }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');

        try {
            const res = await fetch('http://localhost:5000/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-user': 'Kavya@24'
                },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (res.ok) {
                setFormSuccess(`User ${newUser.username} created!`);
                setNewUser({ username: '', password: '', role: 'student' });
                fetchStats(); // Refresh list
            } else {
                setFormError(data.message);
            }
        } catch (err) {
            setFormError("Network Failed");
        }
    };

    const handleDeleteUser = async (username) => {
        if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${username}`, {
                method: 'DELETE',
                headers: { 'x-admin-user': 'Kavya@24' }
            });
            if (res.ok) {
                fetchStats();
            } else {
                alert("Failed to delete user");
            }
        } catch (err) {
            alert("Network Error");
        }
    };


    const handleToggleRole = async (user) => {
        const roles = ['student', 'staff', 'hod', 'admin', 'user'];
        const currentIndex = roles.indexOf(user.role || 'user');
        const nextRole = roles[(currentIndex + 1) % roles.length];

        if (!window.confirm(`Change ${user.username} from ${user.role} to ${nextRole}?`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${user.username}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-user': 'Kavya@24' },
                body: JSON.stringify({ role: nextRole })
            });
            if (res.ok) {
                fetchStats();
            } else {
                alert("Failed to update role");
            }
        } catch (err) {
            alert("Network Error");
        }
    };

    if (loading) return <div className="card">Loading Admin Stats...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Create User Card */}
            <div className="card">
                <h2 style={{ color: '#4f46e5' }}>Manage Users</h2>
                <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Username</label>
                        <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Password</label>
                        <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Role</label>
                        <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="hod">HOD</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ height: '42px' }}>Add User</button>
                </form>
                {formError && <p style={{ color: 'red', marginTop: '10px' }}>{formError}</p>}
                {formSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{formSuccess}</p>}
            </div>

            {/* User List */}
            <div className="card">
                <h2>All Users</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={thStyle}>Username</th>
                                <th style={thStyle}>Role</th>
                                <th style={thStyle}>Last Login</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.username} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>{user.username}</td>
                                    <td style={tdStyle}>
                                        <span style={roleBadgeStyle(user.role)} onClick={() => user.username !== 'Kavya@24' && handleToggleRole(user)} title="Click to cycle role">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleString()}
                                    </td>
                                    <td style={tdStyle}>
                                        {user.username !== 'Kavya@24' && (
                                            <button onClick={() => handleDeleteUser(user.username)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const thStyle = { padding: '12px', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', color: '#334155' };

const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin': return { bg: '#e0e7ff', text: '#4338ca' };
        case 'hod': return { bg: '#fee2e2', text: '#991b1b' };
        case 'staff': return { bg: '#e0f2fe', text: '#075985' };
        case 'student': return { bg: '#dcfce7', text: '#166534' };
        default: return { bg: '#f1f5f9', text: '#64748b' };
    }
};

const roleBadgeStyle = (role) => {
    const { bg, text } = getRoleColor(role);
    return {
        backgroundColor: bg,
        color: text,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8em',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        cursor: 'pointer',
        userSelect: 'none'
    };
};
