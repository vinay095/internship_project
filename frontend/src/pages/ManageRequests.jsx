import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';
import { roomService } from '../services/roomService';
import { authService } from '../services/authService';
import { bookingService } from '../services/bookingService';
import './ManageRequests.css';

function ManageRequests() {
	const { user } = useAuth();
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [showAll, setShowAll] = useState(false);
	const [, forceUpdate] = useState(0);

	const requests = showAll ? requestService.getAllRequests(user.id) : requestService.getPendingRequests(user.id);

	const handleApprove = (requestId) => {
		try {
			requestService.approveRequest(requestId, user.id);
			setMessage('Request approved and room booked!');
			setError('');
			forceUpdate((n) => n + 1);
			setTimeout(() => setMessage(''), 3000);
		} catch (err) {
			setError(err.message);
			setMessage('');
		}
	};

	const handleReject = (requestId) => {
		if (window.confirm('Are you sure you want to reject this request?')) {
			try {
				requestService.rejectRequest(requestId, user.id);
				setMessage('Request rejected');
				setError('');
				forceUpdate((n) => n + 1);
				setTimeout(() => setMessage(''), 3000);
			} catch (err) {
				setError(err.message);
				setMessage('');
			}
		}
	};

	const getStatusClass = (status) => {
		switch (status) {
			case 'approved': return 'status-approved';
			case 'rejected': return 'status-rejected';
			default: return 'status-pending';
		}
	};

	return (
		<div className="manage-requests-page">
			<div className="page-header">
				<h1>Booking Requests</h1>
				<div className="page-actions">
					<button
						className={`btn ${showAll ? 'btn-secondary' : 'btn-primary'}`}
						onClick={() => setShowAll(!showAll)}
					>
						{showAll ? 'Show Pending Only' : 'Show All'}
					</button>
				</div>
			</div>

			{message && <div className="form-success" style={{ marginBottom: 16 }}>{message}</div>}
			{error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

			{requests.length === 0 ? (
				<div className="empty-state">
					<p>No {showAll ? '' : 'pending '}requests from your team.</p>
				</div>
			) : (
				<div className="requests-list">
					{requests.map((req) => {
						const room = roomService.getRoomById(req.roomId);
						const requester = authService.getUserById(req.requestedBy);

						return (
							<div key={req.id} className="request-card">
								<div className="request-card-header">
									<div>
										<h3>{req.title}</h3>
										<span className="requester-info">
											Requested by <strong>{requester?.name}</strong> ({requester?.email})
										</span>
									</div>
									<span className={`request-status ${getStatusClass(req.status)}`}>
										{req.status}
									</span>
								</div>
								<div className="request-details">
									<span> {room?.name} ({room?.location})</span>
									<span> {req.date}</span>
									<span>
										{req.startTime && req.endTime
											? `${bookingService.formatTime(req.startTime)} – ${bookingService.formatTime(req.endTime)}`
											: req.timeSlot || '—'}
									</span>
								</div>
								{req.note && (
									<p className="request-note">Note: {req.note}</p>
								)}
								{req.status === 'pending' && (
									<div className="request-actions">
										<button
											className="btn btn-primary btn-small"
											onClick={() => handleApprove(req.id)}
										>
											✓ Approve
										</button>
										<button
											className="btn btn-danger btn-small"
											onClick={() => handleReject(req.id)}
										>
											Reject
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default ManageRequests;
