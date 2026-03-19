import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-brand">
                    <h1>Competitive Programming Tracker</h1>
                </div>
                <div className="nav-links">
                    {token ? (
                        <>
                            <span className="welcome-text">Welcome, {username}</span>
                            {/* Admin Link Check */}
                            {username && username.trim().toLowerCase() === 'kavya@24' && (
                                <Link to="/admin" className="nav-link" style={{ color: '#4f46e5', fontWeight: 'bold', border: '1px solid #4f46e5', padding: '4px 8px', borderRadius: '4px' }}>
                                    Admin Dashboard
                                </Link>
                            )}
                            {/* Students List Link for Admin, HOD, Staff */}
                            {token && (localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'hod' || localStorage.getItem('role') === 'staff') && (
                                <Link to="/students" className="nav-link">Students</Link>
                            )}
                            <button onClick={handleLogout} className="btn-logout">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <p>By Kavya Gajendran - AIML Department</p>
            </footer>
        </div>
    );
}
