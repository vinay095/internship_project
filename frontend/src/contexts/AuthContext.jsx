import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// load user from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem('mrbs_user');
		const token = localStorage.getItem('mrbs_token');
		if (stored && token) {
			setUser(JSON.parse(stored));
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		const result = await authService.login(email, password);
		setUser(result.user);
		localStorage.setItem('mrbs_user', JSON.stringify(result.user));
		localStorage.setItem('mrbs_token', result.token);
		return result.user;
	};

	const signup = async (data) => {
		const result = await authService.signup(data);
		setUser(result.user);
		localStorage.setItem('mrbs_user', JSON.stringify(result.user));
		localStorage.setItem('mrbs_token', result.token);
		return result.user;
	};

	const ssoLogin = async () => {
		const result = await authService.ssoLogin();
		setUser(result.user);
		localStorage.setItem('mrbs_user', JSON.stringify(result.user));
		localStorage.setItem('mrbs_token', result.token);
		return result.user;
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem('mrbs_user');
		localStorage.removeItem('mrbs_token');
	};

	const isAuthenticated = !!user;

	const hasRole = (role) => {
		if (!user) return false;
		if (role === 'employee') return true; // all roles include employee permissions
		if (role === 'manager') return user.role === 'manager' || user.role === 'hr';
		if (role === 'hr') return user.role === 'hr';
		return false;
	};

	const value = {
		user, loading, login, signup, ssoLogin, logout, isAuthenticated,hasRole,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

export default AuthContext;
