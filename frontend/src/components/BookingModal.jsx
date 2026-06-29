import { useState } from 'react';
import { TIME_SLOTS } from '../data/mock_data';
import './BookingModal.css';

function BookingModal({ room, bookedSlots = [], onClose, onBook }) {
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
	const [timeSlot, setTimeSlot] = useState('');
	const [title, setTitle] = useState('');
	const [attendees, setAttendees] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		if (!timeSlot) {
			setError('Please select a time slot');
			return;
		}
		if (!title.trim()) {
			setError('Please enter a meeting title');
			return;
		}

		const attendeeList = attendees.split(',').map((e) => e.trim()).filter(Boolean);

		onBook({roomId: room.id, date, timeSlot, title: title.trim(), attendees: attendeeList,});
	};

	const availableSlots = TIME_SLOTS.filter((s) => !bookedSlots.includes(s));

	return (
		<div className="modal-overlay" onClick={onClose}>
		<div className="modal" onClick={(e) => e.stopPropagation()}>
			<div className="modal-header">
			<h2>Book Room: {room.name}</h2>
			<button className="modal-close" onClick={onClose}>✕</button>
			</div>

			<form onSubmit={handleSubmit} className="modal-body">
			{error && <div className="form-error">{error}</div>}

			<div className="form-group">
				<label>Date</label>
				<input
				type="date"
				value={date}
				min={new Date().toISOString().split('T')[0]}
				onChange={(e) => setDate(e.target.value)}
				/>
			</div>

			<div className="form-group">
				<label>Time Slot</label>
				<div className="slot-grid">
				{TIME_SLOTS.map((slot) => {
					const isBooked = bookedSlots.includes(slot);
					return (
					<button
						key={slot}
						type="button"
						className={`slot-btn ${isBooked ? 'booked' : ''} ${timeSlot === slot ? 'selected' : ''}`}
						disabled={isBooked}
						onClick={() => setTimeSlot(slot)}
					>
						{slot}
					</button>
					);
				})}
				</div>
			</div>

			<div className="form-group">
				<label>Meeting Title</label>
				<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="e.g. Sprint Planning"
				/>
			</div>

			<div className="form-group">
				<label>Attendee Emails (comma-separated)</label>
				<input
				type="text"
				value={attendees}
				onChange={(e) => setAttendees(e.target.value)}
				placeholder="e.g. john@company.com, jane@company.com"
				/>
			</div>

			<div className="modal-actions">
				<button type="button" className="btn btn-secondary" onClick={onClose}>
				Cancel
				</button>
				<button type="submit" className="btn btn-primary">
				Book
				</button>
			</div>
			</form>
		</div>
		</div>
	);
}

export default BookingModal;
