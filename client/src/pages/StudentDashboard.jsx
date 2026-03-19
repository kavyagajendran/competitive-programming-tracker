import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
    Trophy, Clock, Calendar, Activity,
    ChevronRight, Filter, Download, ExternalLink
} from 'lucide-react';
import { fetchAllContests } from '../services/contestService';

export default function StudentDashboard() {
    const { username: paramUsername } = useParams();
    const [contests, setContests] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registeredContests, setRegisteredContests] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const username = paramUsername || localStorage.getItem('username');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Parallel fetch: Contests (merged), Announcements, Registrations, Stats
            const [fetchedContests, announceRes, regRes, statsRes] = await Promise.all([
                fetchAllContests(),
                fetch('/api/announcements', {
                    headers: { 'x-department-context': localStorage.getItem('department') }
                }),
                fetch('/api/user/registrations', {
                    headers: { 'x-user': username }
                }),
                fetch(`/api/student/stats/${username}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setContests(fetchedContests);
            if (announceRes.ok) setAnnouncements(await announceRes.json());
            if (regRes.ok) setRegisteredContests(await regRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRegistration = async (contestUrl, currentlyRegistered) => {
        try {
            const action = currentlyRegistered ? 'unregister' : 'register';
            const response = await fetch('/api/user/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, contestUrl, action })
            });

            if (response.ok) {
                const data = await response.json();
                setRegisteredContests(data.registeredContests);
            }
        } catch (e) {
            console.error("Failed to toggle registration", e);
        }
    };

    if (loading) return <div className="dashboard-container"><div className="loading-spinner">Loading Profile Analysis...</div></div>;

    const filteredPerformanceData = stats?.performanceData?.filter(item => {
        if (!dateRange.start && !dateRange.end) return true;
        const itemDate = new Date(item.date);
        const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01');
        const end = dateRange.end ? new Date(dateRange.end) : new Date('2099-12-31');
        return itemDate >= start && itemDate <= end;
    }) || [];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>{username}'s Dashboard</h1>
                    <p className="dashboard-subtitle">Performance Analytics & Activity Tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchData} className="btn-secondary">Refresh Analytics</button>
                </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Trophy size={22} color="#ffa116" />
                        <span style={{ fontSize: '0.85em', color: '#64748b' }}>LeetCode</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.leetcode?.rating || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: '#10b981' }}>{stats?.leetcode?.solved} Solved</div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Activity size={22} color="#1890ff" />
                        <span style={{ fontSize: '0.85em', color: '#64748b' }}>Codeforces</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.codeforces?.rating || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6366f1' }}>{stats?.codeforces?.rank}</div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Clock size={22} color="#6366f1" />
                        <span style={{ fontSize: '0.85em', color: '#64748b' }}>Hours Active</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.activity?.totalWorkingHours || 0}h</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{stats?.activity?.weeklyAverage}h / week</div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Calendar size={22} color="#10b981" />
                        <span style={{ fontSize: '0.85em', color: '#64748b' }}>Days Tracked</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{stats?.activity?.daysActive || 0}</div>
                    <div style={{ fontSize: '0.9rem', color: '#10b981' }}>Consistency: 85%</div>
                </div>
            </div>

            <div className="dashboard-grid-2">
                <div className="premium-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>Consistent Performance</h3>
                            <p style={{ fontSize: '0.85em', color: '#64748b' }}>Rating Trend</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Filter size={14} color="#64748b" />
                            <input
                                type="date"
                                className="form-control"
                                style={{ padding: '4px 8px', fontSize: '0.85em', width: 'auto' }}
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <span>-</span>
                            <input
                                type="date"
                                className="form-control"
                                style={{ padding: '4px 8px', fontSize: '0.85em', width: 'auto' }}
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ height: '320px', width: '100%', marginTop: '20px' }}>
                        <ResponsiveContainer>
                            <LineChart data={filteredPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="rating" name="Rating" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                                <Line type="monotone" dataKey="solved" name="Solved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-card">
                    <div className="card-header">
                        <h3>Working Hours summary</h3>
                        <p style={{ fontSize: '0.85em', color: '#64748b' }}>Effort distribution</p>
                    </div>
                    <div style={{ height: '320px', width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '60%', height: '100%' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={stats?.workingHours || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {(stats?.workingHours || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ width: '40%', paddingLeft: '10px' }}>
                            {(stats?.workingHours || []).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color, marginRight: '8px' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.value}h</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid-2" style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card">
                        <div className="card-header">
                            <h3>Recent Announcements</h3>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            {announcements.slice(0, 3).map(ann => (
                                <div key={ann.id} className="announcement-item-new" style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ann.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{ann.content.substring(0, 100)}...</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                                        {ann.author} • {new Date(ann.date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

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
                                                <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem', borderBottom: '1px solid #eef2ff', paddingBottom: '5px', textTransform: 'capitalize' }}>
                                                    {platform}
                                                </h3>
                                                {platformContests.map((contest, cIdx) => (
                                                    <div key={cIdx} className="announcement-item-new" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <h4 style={{ fontSize: '1rem', margin: 0, fontWeight: 600, flex: 1 }}>{contest.name}</h4>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontSize: '0.7rem', color: registeredContests.includes(contest.url) ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                                                                    {registeredContests.includes(contest.url) ? 'Registered' : 'Not Registered'}
                                                                </span>
                                                                <label className="registration-toggle">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={registeredContests.includes(contest.url)}
                                                                        onChange={() => handleToggleRegistration(contest.url, registeredContests.includes(contest.url))}
                                                                    />
                                                                    <span className="registration-slider"></span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>
                                                            {new Date(contest.startTime).toLocaleString()}
                                                        </div>
                                                        <a
                                                            href={contest.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontWeight: 500 }}
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

                <div className="premium-card">
                    <div className="card-header">
                        <h3>Registered Contests</h3>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        {registeredContests.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No registrations yet.</p>
                        ) : (
                            registeredContests.map((url, idx) => (
                                <div key={idx} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                        {url.replace('https://', '')}
                                    </div>
                                    <a href={url} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}><ExternalLink size={16} /></a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
