import { useState } from 'react';
import './BookingModal.css';

function InviteModal({ booking, onClose, onSend }) {
	const [emails, setEmails] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		const emailList = emails.split(',').map((email) => email.trim()).filter(Boolean);

		if (emailList.length === 0) {
			setError('Please enter at least one email address');
			return;
		}

		const invalidEmails = emailList.filter((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
						// start with atleast 1 char, include `@`, min 1 char, `.`, atleast one char
		if (invalidEmails.length > 0) {
			setError(`Invalid emails: ${invalidEmails.join(', ')}`);
			return;
		}

		onSend(booking.id, emailList);
		setSuccess(`Invites sent to ${emailList.length} attendee(s)`);
		setEmails('');
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
		<div className="modal" onClick={(e) => e.stopPropagation()}>
			<div className="modal-header">
			<h2>Send Meeting Invites</h2>
			<button className="modal-close" onClick={onClose}>✕</button>
			</div>

			<div className="modal-body">
			<div style={{ marginBottom: 16 }}>
				<p style={{ margin: '0 0 4px', fontSize: 13, color: '#606770' }}>
				Meeting: <strong>{booking.title}</strong>
				</p>
				<p style={{ margin: 0, fontSize: 13, color: '#606770' }}>
				{booking.date} · {booking.timeSlot}
				</p>
			</div>

			{booking.attendees.length > 0 && (
				<div style={{ marginBottom: 16 }}>
				<label style={{ fontSize: 13, fontWeight: 600, color: '#606770' }}>
					Current Attendees:
				</label>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
					{booking.attendees.map((a) => (
					<span key={a} className="amenity-tag">{a}</span>
					))}
				</div>
				</div>
			)}

			{error && <div className="form-error">{error}</div>}
			{success && <div className="form-success">{success}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
				<label>Email Addresses (comma-separated)</label>
				<textarea
					value={emails}
					onChange={(e) => setEmails(e.target.value)}
					placeholder="john@company.com, jane@company.com"
					rows={3}
				/>
				</div>

				<div className="modal-actions">
				<button type="button" className="btn btn-secondary" onClick={onClose}>
					Close
				</button>
				<button type="submit" className="btn btn-primary">
					Send Invites
				</button>
				</div>
			</form>
			</div>
		</div>
		</div>
	);
}

export default InviteModal;
