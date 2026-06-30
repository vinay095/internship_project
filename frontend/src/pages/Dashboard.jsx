import { useAuth } from '../contexts/AuthContext';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import { requestService } from '../services/requestService';
import './Dashboard.css';

function Dashboard() {
	const { user, hasRole } = useAuth();

	const today = bookingService.getLocalDateString();
	const rooms = roomService.getRooms(user.location);
	const todayBookings = bookingService.getBookings({ date: today });
	const myBookings = bookingService.getBookings({ bookedBy: user.id, date: today });

	const pendingRequests = hasRole('manager') ? requestService.getPendingRequests(user.id) : [];

	const myRequests = user.role === 'employee' ? requestService.getMyRequests(user.id) : [];

	const pendingCount = myRequests.filter((r) => r.status === 'pending').length;

	return (
		<div className="dashboard">
		<div className="page-header">
			<h1>Welcome back, {user.name}</h1>
			<p className="page-subtitle">
			{new Date().toLocaleDateString('en-IN', {
				weekday: 'long', year: 'numeric',  month: 'long', day: 'numeric',})
			}
			{' · '}{user.location}
			</p>
		</div>

		<div className="stats-grid">
			<div className="stat-card">
				<div className="stat-number">{rooms.length}</div>
				<div className="stat-label">Rooms at {user.location}</div>
			</div>
			<div className="stat-card">
				<div className="stat-number">{todayBookings.length}</div>
				<div className="stat-label">Bookings Today</div>
			</div>
			<div className="stat-card">
				<div className="stat-number">{myBookings.length}</div>
				<div className="stat-label">My Bookings Today</div>
			</div>
			{hasRole('manager') && (
				<div className="stat-card">
					<div className="stat-number">{pendingRequests.length}</div>
					<div className="stat-label">Pending Requests</div>
				</div>
			)}
			{user.role === 'employee' && (
				<div className="stat-card">
					<div className="stat-number">{pendingCount}</div>
					<div className="stat-label">My Pending Requests</div>
				</div>
			)}
		</div>

		{todayBookings.length > 0 && (
			<div className="dashboard-section">
				<h2>Today's Bookings</h2>
				<div className="booking-list-simple">
				{todayBookings.map((b) => {
					const room = roomService.getRoomById(b.roomId);
					return (
						<div key={b.id} className="booking-item-simple">
						<div className="booking-time">
							{b.startTime && b.endTime
								? `${bookingService.formatTime(b.startTime)} – ${bookingService.formatTime(b.endTime)}`
								: b.timeSlot || '—'}
						</div>
						<div className="booking-info">
							<strong>{b.title}</strong>
							<span>{room?.name} · {room?.location}</span>
						</div>
						</div>
					);
				})}
			</div>
			</div>
		)}
		</div>
	);
}

export default Dashboard;
