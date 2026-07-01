import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
	const { user, logout, hasRole } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<nav className="navbar">
			<div className="navbar-left">
				<NavLink to="/dashboard" className="navbar-brand">MeetingRoom</NavLink>
			</div>

			<div className="navbar-center">
				<NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
				<NavLink to="/rooms" className="nav-link">Rooms</NavLink>
				<NavLink to="/bookings" className="nav-link">Bookings</NavLink>
				{user?.role === 'employee' && (
					<NavLink to="/my-requests" className="nav-link">My Requests</NavLink>
				)}
				{hasRole('manager') && (
					<NavLink to="/manage-requests" className="nav-link">Requests</NavLink>
				)}
				{hasRole('admin') && (
					<NavLink to="/manage-rooms" className="nav-link">Manage Rooms</NavLink>
				)}
				{hasRole('admin') && (
					<NavLink to="/reports" className="nav-link">Reports</NavLink>
				)}
			</div>

			<div className="navbar-right">
				<div className="user-info">
					<span className="user-avatar">
						{user?.name?.charAt(0).toUpperCase()}
					</span>
					<div className="user-details">
						<span className="user-name">{user?.name}</span>
						<span className="user-role">{user?.role} · {user?.location}</span>
					</div>
				</div>
				<button onClick={handleLogout} className="btn-logout">
					Logout
				</button>
			</div>
		</nav>
	);
}

export default Navbar;
