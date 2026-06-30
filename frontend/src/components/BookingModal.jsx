import { useState, useMemo } from 'react';
import { bookingService } from '../services/bookingService';
import './BookingModal.css';

// Old: imported fixed TIME_SLOTS from mock_data, rendered a flat grid of slot buttons.
// New: dynamic start/end time pickers with 15-minute intervals over a 24-hour cycle.

function BookingModal({ room, onClose, onBook }) {
	const [date, setDate] = useState(bookingService.getLocalDateString());
	const [startTime, setStartTime] = useState('09:00');
	const [endTime, setEndTime] = useState('10:00');
	const [title, setTitle] = useState('');
	const [attendees, setAttendees] = useState('');
	const [error, setError] = useState('');

	// Dynamically fetch bookings matching the currently selected date
	const bookedRanges = useMemo(() => {
		return bookingService.getBookedRanges(room.id, date);
	}, [room.id, date]);

	const timeOptions = useMemo(() => bookingService.generateTimeOptions(), []);

	// Dynamically filter end-time options to only show times after startTime
	const endTimeOptions = useMemo(() => {
		return timeOptions.filter((t) => t > startTime);
	}, [timeOptions, startTime]);

	// Fix: if endTime is no longer valid after startTime changes, reset it
	const handleStartTimeChange = (e) => {
		const newStart = e.target.value;
		setStartTime(newStart);
		if (endTime <= newStart) {
			// pick the next 15-min slot after newStart
			const idx = timeOptions.indexOf(newStart);
			setEndTime(timeOptions[idx + 1] || '23:45');
		}
	};

	// Check if chosen range overlaps with any existing booking
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
		if (rangeConflict) {
			setError(`Conflicts with "${rangeConflict.title}" (${bookingService.formatTime(rangeConflict.startTime)} – ${bookingService.formatTime(rangeConflict.endTime)})`);
			return;
		}

		const attendeeList = attendees
			.split(',')
			.map((e) => e.trim())
			.filter(Boolean);

		onBook({ roomId: room.id, date, startTime, endTime, title: title.trim(), attendees: attendeeList });
	};

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

					{/* Existing bookings for the chosen date on this room */}
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
						<button type="submit" className="btn btn-primary" disabled={!!rangeConflict}>
							Book
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default BookingModal;
