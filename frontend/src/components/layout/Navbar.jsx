import { Link, useNavigate } from 'react-router-dom';
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
			<Link to="/dashboard" className="navbar-brand">
			MeetingRoom
			</Link>
		</div>

		<div className="navbar-center">
			<Link to="/dashboard" className="nav-link">Dashboard</Link>
			<Link to="/rooms" className="nav-link">Rooms</Link>
			<Link to="/bookings" className="nav-link">Bookings</Link>
			{user?.role === 'employee' && (
				<Link to="/my-requests" className="nav-link">My Requests</Link>
			)}
			{hasRole('manager') && (
				<Link to="/manage-requests" className="nav-link">Requests</Link>
			)}
			{hasRole('hr') && (
				<Link to="/manage-rooms" className="nav-link">Manage Rooms</Link>
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
