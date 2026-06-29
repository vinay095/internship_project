import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { authService } from '../services/authService';
import InviteModal from '../components/InviteModal';
import './Bookings.css';

function Bookings() {
	const { user } = useAuth();
	const [inviteBooking, setInviteBooking] = useState(null);
	const [message, setMessage] = useState('');
	const [, forceUpdate] = useState(0);

	const bookings = bookingService.getBookings({});

	const handleSendInvites = (bookingId, emails) => {
		try {
			bookingService.sendInvites(bookingId, emails);
			setMessage('Invites sent successfully!');
			forceUpdate((n) => n + 1);
			setTimeout(() => setMessage(''), 3000);
		} catch (err) {
			alert(err.message);
		}
	};

	const handleCancel = (bookingId) => {
		if (window.confirm('Are you sure you want to cancel this booking?')) {
			try {
				bookingService.cancelBooking(bookingId);
				setMessage('Booking cancelled');
				forceUpdate((n) => n + 1);
				setTimeout(() => setMessage(''), 3000);
			} catch (err) {
				alert(err.message);
			}
		}
	};

	return (
		<div className="bookings-page">
		<div className="page-header">
			<h1>All Bookings</h1>
		</div>

		{message && <div className="form-success" style={{ marginBottom: 16 }}>{message}</div>}

		{bookings.length === 0 ? (
			<div className="empty-state"><p>No bookings yet</p></div>) : (
			<div className="bookings-table-wrapper">
			<table className="bookings-table">
				<thead>
				<tr>
					<th>Date</th>
					<th>Time</th>
					<th>Room</th>
					<th>Title</th>
					<th>Booked By</th>
					<th>Attendees</th>
					<th>Actions</th>
				</tr>
				</thead>
				<tbody>
				{bookings.map((b) => {
					const room = roomService.getRoomById(b.roomId);
					const booker = authService.getUserById(b.bookedBy);
					const isOwner = b.bookedBy === user.id;

					return (
						<tr key={b.id}>
							<td>{b.date}</td>
							<td><span className="booking-time">{b.timeSlot}</span></td>
							<td>
							<strong>{room?.name}</strong>
							<br />
							<span className="text-muted">{room?.location}</span>
							</td>
							<td>{b.title}</td>
							<td>
							<span className="booker-name">{booker?.name || 'Unknown'}</span>
							<br />
							<span className="text-muted">{booker?.role}</span>
							</td>
							<td>
							{b.attendees.length > 0 ? (
								<span className="attendee-count">
								{b.attendees.length} attendee(s)
								</span>
							) : (
								<span className="text-muted">None</span>
							)}
							</td>
							<td>
							<div className="action-btns">
								{isOwner && (
								<>
									<button
										className="btn btn-small btn-primary"
										onClick={() => setInviteBooking(b)}
									>
										Invite
									</button>
									<button
										className="btn btn-small btn-danger"
										onClick={() => handleCancel(b.id)}
									>
									Cancel
									</button>
								</>
								)}
							</div>
							</td>
						</tr>
					);
				})}
				</tbody>
			</table>
			</div>
		)}

		{inviteBooking && (
			<InviteModal
			booking={inviteBooking}
			onClose={() => setInviteBooking(null)}
			onSend={handleSendInvites}
			/>
		)}
		</div>
	);
}

export default Bookings;
