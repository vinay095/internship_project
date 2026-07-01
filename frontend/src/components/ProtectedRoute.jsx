import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, allowedRoles = [] }) {
	const { user, isAuthenticated, loading } = useAuth();

	if (loading) {
		return <div className="loading">Loading...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles.length > 0) {
		// admin has all permissions, manager has manager+employee permissions
		const roleHierarchy = { admin: 3, manager: 2, employee: 1 };
		const userLevel = roleHierarchy[user.role] || 0;
		const requiredLevel = Math.min(
			...allowedRoles.map((r) => roleHierarchy[r] || 0)
		);

		if (userLevel < requiredLevel) {
			return <Navigate to="/dashboard" replace />;
		}
	}

	return children;
}

export default ProtectedRoute;
