import { Navigate } from 'react-router-dom';


export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to their default dashboard if unauthorized
        return <Navigate to="/" replace />;
    }

    return children;
}
