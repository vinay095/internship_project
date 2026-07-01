import { useState, useMemo } from 'react';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { useAuth } from '../contexts/AuthContext';
import './BookingModal.css';
import './EditBookingModal.css';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, HourglassIcon } from '@hugeicons/core-free-icons';

// Weekday definitions — Mon to Fri only (getDay() values)
const WEEKDAYS = [
	{ label: 'Mon', value: 1 },
	{ label: 'Tue', value: 2 },
	{ label: 'Wed', value: 3 },
	{ label: 'Thu', value: 4 },
	{ label: 'Fri', value: 5 },
];

/**
 * EditBookingModal — lets a meeting organiser:
 *  - Change the meeting title
 *  - Shift date / start-time / end-time
 *  - Switch to any available room in the same location
 *  - Invite additional attendees (comma-separated emails)
 *  - Make the meeting recurring on selected Mon–Fri weekdays up to an end date
 */
function EditBookingModal({ booking, onClose, onSave }) {
	const { user } = useAuth();
	const room = roomService.getRoomById(booking.roomId);

	// pre--fill all fields from the existing booking
	const [title, setTitle] = useState(booking.title);
	const [date, setDate] = useState(booking.date);
	const [startTime, setStartTime] = useState(booking.startTime);
	const [endTime, setEndTime] = useState(booking.endTime);
	const [selectedRoom, setSelectedRoom] = useState(booking.roomId);
	const [newEmails, setNewEmails] = useState('');
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');

	// Recurring meeting state 
	const [isRecurring, setIsRecurring] = useState(false);		// default: False
	const [recurDays, setRecurDays] = useState([]);           // selected weekday numbers
	const [recurEndDate, setRecurEndDate] = useState('');           // YYYY-MM-DD

	// Time options 
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

	const duration = bookingService.getDurationLabel(startTime, endTime);

	// Live room availability 
	const roomsStatus = useMemo(() => {
		if (!room?.location || !date || !startTime || !endTime) return [];
		return bookingService.getRoomsStatus(
			room.location,
			date,
			startTime,
			endTime,
			booking.id
		);
	}, [room?.location, date, startTime, endTime, booking.id]);

	const selectedRoomStatus = roomsStatus.find((s) => s.room.id === selectedRoom);
	const hasConflict = selectedRoomStatus && !selectedRoomStatus.isAvailable;

	// Weekday toggle 
	const toggleWeekday = (dayValue) => {
		setRecurDays((prev) =>
			prev.includes(dayValue)
				? prev.filter((d) => d !== dayValue)
				: [...prev, dayValue]
		);
	};

	// Submit
	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		setSuccessMsg('');

		if (!title.trim()) {
			setError('Meeting title cannot be empty.');
			return;
		}
		if (hasConflict) {
			setError(`"${selectedRoomStatus.conflictTitle}" is already booked in the selected room at that time.`);
			return;
		}
		if (isRecurring) {
			if (recurDays.length === 0) {
				setError('Please select at least one weekday for recurrence.');
				return;
			}
			if (!recurEndDate) {
				setError('Please choose a recurrence end date.');
				return;
			}
			if (recurEndDate < date) {
				setError('Recurrence end date must be on or after the start date.');
				return;
			}
		}

		const newAttendeeList = newEmails
			.split(',')
			.map((em) => em.trim())
			.filter(Boolean);

		try {
			// 1. Update the original booking
			bookingService.updateBooking(booking.id, {
				roomId: selectedRoom,
				date,
				startTime,
				endTime,
				title,
				newAttendees: newAttendeeList,
			});

			// 2. If recurring, generate all future occurrences
			if (isRecurring) {
				const { created, skipped } = bookingService.createRecurringBookings({
					roomId: selectedRoom,
					startDate: date,
					endDate: recurEndDate,
					recurDays,
					startTime,
					endTime,
					title,
					bookedBy: user.id,
					attendees: [...(booking.attendees || []), ...newAttendeeList],
					excludeId: booking.id,
				});

				const skippedNote = skipped > 0 ? ` (${skipped} date${skipped > 1 ? 's' : ''} skipped due to conflicts)` : '';
				setSuccessMsg(`✓ ${created} recurring meeting${created !== 1 ? 's' : ''} created${skippedNote}.`);
				// Delay close so user sees the count summary
				setTimeout(() => onSave(), 2000);
			} else {
				onSave();
			}
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>

				{/* Header */}
				<div className="modal-header">
					<h2>Edit Booking</h2>
					<button className="modal-close" onClick={onClose}>✕</button>
				</div>

				<form onSubmit={handleSubmit} className="modal-body">
					{error && <div className="form-error">{error}</div>}
					{successMsg && <div className="form-success">{successMsg}</div>}

					{/* Meeting title */}
					<div className="form-group">
						<label>Meeting Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. Sprint Planning"
						/>
					</div>

					{/* Date */}
					<div className="form-group">
						<label>Date</label>
						<input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
					</div>

					{/* Start / End time row */}
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
							{hasConflict ? 
								(<>
									<HugeiconsIcon icon={Alert02Icon} />
									{' '}Conflict in selected room
								</>) : (
								<>
									<HugeiconsIcon icon={HourglassIcon} />
									{' '}Duration: {duration}
								</>
							)}
						</div>
					)}

					{/* Room selector with live status */}
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
											{isAvailable ? '✓ Available' : `✗ "${conflictTitle}"`}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Recurring Meeting Toggle */}
					<div className="ebm-recurring-section">
						<button
							type="button"
							className={`ebm-recurring-toggle ${isRecurring ? 'ebm-recurring-active' : ''}`}
							onClick={() => {
								setIsRecurring((v) => !v);
								if (!isRecurring) setRecurDays([]);
							}}
						>
							<span className="ebm-recurring-icon"></span>
							<span>Recurring Meeting</span>
							<span className={`ebm-toggle-pill ${isRecurring ? 'pill-on' : 'pill-off'}`}>
								{isRecurring ? 'ON' : 'OFF'}
							</span>
						</button>

						{isRecurring && (
							<div className="ebm-recurring-body">
								{/* Weekday picker */}
								<div className="ebm-weekday-label">Repeat on</div>
								<div className="ebm-weekday-row">
									{WEEKDAYS.map(({ label, value }) => (
										<button
											key={value}
											type="button"
											className={`ebm-day-pill ${recurDays.includes(value) ? 'ebm-day-active' : ''}`}
											onClick={() => toggleWeekday(value)}
										>
											{label}
										</button>
									))}
								</div>

								{/* End date picker */}
								<div className="form-group" style={{ marginTop: 12 }}>
									<label>Recurrence End Date</label>
									<input
										type="date"
										value={recurEndDate}
										min={date}
										onChange={(e) => setRecurEndDate(e.target.value)}
									/>
								</div>

								{/* Summary preview */}
								{recurDays.length > 0 && recurEndDate && (
									<div className="ebm-recur-summary">
										🗓 Repeats every&nbsp;
										<strong>
											{recurDays
												.sort((a, b) => a - b)
												.map((d) => WEEKDAYS.find((w) => w.value === d)?.label)
												.join(', ')}
										</strong>
										&nbsp;until&nbsp;<strong>{recurEndDate}</strong>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Existing attendees (read-only display) */}
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

					{/* Invite new attendees */}
					<div className="form-group">
						<label>Invite New Attendees <span className="text-muted" style={{ fontWeight: 400 }}>(comma-separated emails)</span></label>
						<input
							type="text"
							value={newEmails}
							onChange={(e) => setNewEmails(e.target.value)}
							placeholder="e.g. alice@company.com, bob@company.com"
						/>
					</div>

					{/* Actions */}
					<div className="modal-actions">
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary" disabled={hasConflict}>
							{isRecurring ? 'Save & Create Recurrences' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default EditBookingModal;
