import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';
import { roomService } from '../services/roomService';
import { authService } from '../services/authService';
import './MyRequests.css';

function MyRequests() {
	const { user } = useAuth();
	const [, forceUpdate] = useState(0);

	const requests = requestService.getMyRequests(user.id);

	const getStatusClass = (status) => {
		switch (status) {
			case 'approved': return 'status-approved';
			case 'rejected': return 'status-rejected';
			default: return 'status-pending';
		}
	};

	return (
		<div className="my-requests-page">
		<div className="page-header">
			<h1>My Booking Requests</h1>
		</div>

		{requests.length === 0 ? (
			<div className="empty-state">
			<p>You haven't made any booking requests yet. Go to <strong>Rooms</strong> to request a booking.</p>
			</div>
			) : (
				<div className="requests-list">
				{requests.map((req) => {
					const room = roomService.getRoomById(req.roomId);
					const manager = authService.getUserById(req.managerId);

					return (
					<div key={req.id} className="request-card">
						<div className="request-card-header">
						<h3>{req.title}</h3>
						<span className={`request-status ${getStatusClass(req.status)}`}>
							{req.status}
						</span>
						</div>
						<div className="request-details">
						<span> {room?.name} ({room?.location})</span>
						<span> {req.date}</span>
						<span> {req.timeSlot}</span>
						<span> Requested to: {manager?.name || 'Unknown'}</span>
						</div>
						{req.note && (
						<p className="request-note">Note: {req.note}</p>
						)}
					</div>
					);
				})}
			</div>
		)}
		</div>
	);
}

export default MyRequests;
