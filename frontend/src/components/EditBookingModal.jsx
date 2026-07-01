import { useState, useMemo } from 'react';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import './BookingModal.css';
import './EditBookingModal.css';

/**
 * EditBookingModal — lets a meeting organiser:
 *  • Change the meeting title
 *  • Shift date / start-time / end-time
 *  • Switch to any available room in the same location
 *  • Invite additional attendees (comma-separated emails)
 */
function EditBookingModal({ booking, onClose, onSave }) {
	const room = roomService.getRoomById(booking.roomId);

	// Pre-fill all fields from the existing booking
	const [title, setTitle] = useState(booking.title);
	const [date, setDate] = useState(booking.date);
	const [startTime, setStartTime] = useState(booking.startTime);
	const [endTime, setEndTime] = useState(booking.endTime);
	const [selectedRoom, setSelectedRoom] = useState(booking.roomId);
	const [newEmails, setNewEmails] = useState('');
	const [error, setError] = useState('');

	// 15-minute interval options for the whole day
	const timeOptions = useMemo(() => bookingService.generateTimeOptions(), []);

	// End-time list: only times strictly after the chosen start
	const endTimeOptions = useMemo(
		() => timeOptions.filter((t) => t > startTime),
		[timeOptions, startTime]
	);

	// Auto-advance endTime if startTime is moved past it
	const handleStartTimeChange = (e) => {
		const newStart = e.target.value;
		setStartTime(newStart);
		if (endTime <= newStart) {
			const idx = timeOptions.indexOf(newStart);
			setEndTime(timeOptions[idx + 1] || '23:45');
		}
	};

	// Duration label for the selected window
	const duration = bookingService.getDurationLabel(startTime, endTime);

	// Live room-status list — re-runs whenever date/times change
	// excludeBookingId prevents the current booking from clashing with itself
	const roomsStatus = useMemo(() => {
		if (!room?.location || !date || !startTime || !endTime) return [];
		return bookingService.getRoomsStatus(
			room.location,
			date,
			startTime,
			endTime,
			booking.id          // exclude this booking from conflict detection
		);
	}, [room?.location, date, startTime, endTime, booking.id]);

	// Does the currently selected room have a conflict right now?
	const selectedRoomStatus = roomsStatus.find((s) => s.room.id === selectedRoom);
	const hasConflict = selectedRoomStatus && !selectedRoomStatus.isAvailable;

	// ── Submit handler ──────────────────────────────────────────────────────────
	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		if (!title.trim()) {
			setError('Meeting title cannot be empty.');
			return;
		}
		if (hasConflict) {
			setError(`"${selectedRoomStatus.conflictTitle}" is already booked in the selected room at that time.`);
			return;
		}

		const newAttendeeList = newEmails
			.split(',')
			.map((em) => em.trim())
			.filter(Boolean);

		try {
			bookingService.updateBooking(booking.id, {
				roomId: selectedRoom,
				date,
				startTime,
				endTime,
				title,
				newAttendees: newAttendeeList,
			});
			onSave();   // tell parent to refresh + close
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>

				{/* ── Header ── */}
				<div className="modal-header">
					<h2>Edit Booking</h2>
					<button className="modal-close" onClick={onClose}>✕</button>
				</div>

				<form onSubmit={handleSubmit} className="modal-body">
					{error && <div className="form-error">{error}</div>}

					{/* ── Meeting title ── */}
					<div className="form-group">
						<label>Meeting Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Sprint Planning"
						/>
					</div>

					{/* ── Date ── */}
					<div className="form-group">
						<label>Date</label>
						<input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>

					{/* ── Start / End time row ── */}
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

					{/* Duration badge */}
					{duration && (
						<div className={`duration-badge ${hasConflict ? 'duration-conflict' : ''}`}>
							{hasConflict ? '⚠ Conflict in selected room' : `⏱ Duration: ${duration}`}
						</div>
					)}

					{/* ── Room selector with live status ── */}
					<div className="form-group">
						<label>
							Room — <span className="text-muted" style={{ fontWeight: 400 }}>
								{room?.location} · all rooms shown
							</span>
						</label>
						<div className="ebm-room-list">
							{roomsStatus.map(({ room: r, isAvailable, conflictTitle }) => {
								const isSelected = selectedRoom === r.id;
								return (
									<button
										key={r.id}
										type="button"
										className={[
											'ebm-room-btn',
											isSelected ? 'ebm-room-selected' : '',
											!isAvailable ? 'ebm-room-occupied' : 'ebm-room-free',
										].join(' ')}
										onClick={() => setSelectedRoom(r.id)}
									>
										<span className="ebm-room-name">{r.name}</span>
										<span className="ebm-room-cap">Cap: {r.capacity}</span>
										<span className={`ebm-room-badge ${isAvailable ? 'badge-free' : 'badge-busy'}`}>
											{isAvailable
												? '✓ Available'
												: `✗ "${conflictTitle}"`}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* ── Existing attendees (read-only display) ── */}
					{booking.attendees.length > 0 && (
						<div className="form-group">
							<label>Current Attendees</label>
							<div className="booked-ranges-list">
								{booking.attendees.map((email, i) => (
									<span key={i} className="booked-range-tag" style={{ color: 'var(--color-accent)' }}>
										{email}
									</span>
								))}
							</div>
						</div>
					)}

					{/* ── Invite new attendees ── */}
					<div className="form-group">
						<label>Invite New Attendees <span className="text-muted" style={{ fontWeight: 400 }}>(comma-separated emails)</span></label>
						<input
							type="text"
							value={newEmails}
							onChange={(e) => setNewEmails(e.target.value)}
							placeholder="e.g. alice@company.com, bob@company.com"
						/>
					</div>

					{/* ── Actions ── */}
					<div className="modal-actions">
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary" disabled={hasConflict}>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default EditBookingModal;
