import { useState, useMemo } from 'react';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import './BookingModal.css';

// Old: imported TIME_SLOTS and rendered slot-grid buttons.
// New: dynamic start/end time pickers.

function RequestModal({ room, bookedRanges = [], onClose, onRequest }) {
	const { user } = useAuth();
	const [date, setDate] = useState(bookingService.getLocalDateString());
	const [startTime, setStartTime] = useState('09:00');
	const [endTime, setEndTime] = useState('10:00');
	const [title, setTitle] = useState('');
	const [note, setNote] = useState('');
	const [managerId, setManagerId] = useState(user?.reportingManagerId || '');
	const [error, setError] = useState('');

	const managers = authService.getManagers();
	const timeOptions = useMemo(() => bookingService.generateTimeOptions(), []);

	const endTimeOptions = useMemo(
		() => timeOptions.filter((t) => t > startTime),
		[timeOptions, startTime]
	);

	const handleStartTimeChange = (e) => {
		const newStart = e.target.value;
		setStartTime(newStart);
		if (endTime <= newStart) {
			const idx = timeOptions.indexOf(newStart);
			setEndTime(timeOptions[idx + 1] || '23:45');
		}
	};

	const rangeConflict = bookedRanges.find((r) =>
		bookingService.timesOverlap(startTime, endTime, r.startTime, r.endTime)
	);

	const duration = bookingService.getDurationLabel(startTime, endTime);

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		if (!title.trim()) {
			setError('Please enter a meeting title');
			return;
		}
		if (!managerId) {
			setError('Please select a manager');
			return;
		}
		if (rangeConflict) {
			setError(`Conflicts with "${rangeConflict.title}" (${bookingService.formatTime(rangeConflict.startTime)} – ${bookingService.formatTime(rangeConflict.endTime)})`);
			return;
		}

		onRequest({ roomId: room.id, managerId, date, startTime, endTime, title: title.trim(), note: note.trim() });
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Request Booking: {room.name}</h2>
					<button className="modal-close" onClick={onClose}>✕</button>
				</div>

				<form onSubmit={handleSubmit} className="modal-body">
					{error && <div className="form-error">{error}</div>}

					<div className="form-group">
						<label>Request to (Manager)</label>
						<select value={managerId} onChange={(e) => setManagerId(e.target.value)}>
							<option value="">Select Manager</option>
							{managers.map((m) => (
								<option key={m.id} value={m.id}>
									{m.name} ({m.role}) - {m.location}
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label>Date</label>
						<input
							type="date"
							value={date}
							min={bookingService.getLocalDateString()}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>Start Time</label>
							<select value={startTime} onChange={handleStartTimeChange}>
								{timeOptions.slice(0, -1).map((t) => (
									<option key={t} value={t}>{bookingService.formatTime(t)}</option>
								))}
							</select>
						</div>
						<div className="form-group">
							<label>End Time</label>
							<select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
								{endTimeOptions.map((t) => (
									<option key={t} value={t}>{bookingService.formatTime(t)}</option>
								))}
							</select>
						</div>
					</div>

					{duration && (
						<div className={`duration-badge ${rangeConflict ? 'duration-conflict' : ''}`}>
							{rangeConflict
								? `⚠ Conflicts with "${rangeConflict.title}"`
								: `⏱ Duration: ${duration}`}
						</div>
					)}

					{bookedRanges.length > 0 && (
						<div className="form-group">
							<label>Already booked today</label>
							<div className="booked-ranges-list">
								{bookedRanges.map((r, i) => (
									<span key={i} className="booked-range-tag">
										{bookingService.formatTime(r.startTime)} – {bookingService.formatTime(r.endTime)}
									</span>
								))}
							</div>
						</div>
					)}

					<div className="form-group">
						<label>Meeting Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Team Sync"
						/>
					</div>

					<div className="form-group">
						<label>Note to Manager (optional)</label>
						<textarea
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="Any additional details..."
						/>
					</div>

					<div className="modal-actions">
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary" disabled={!!rangeConflict}>
							Send Request
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default RequestModal;
