import { useState, useMemo } from 'react';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { useAuth } from '../contexts/AuthContext';
import MiniCalendar from './MiniCalendar';
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
	const [isRecurring, setIsRecurring] = useState(booking.isRecurring || false);		// default: False
	const [recurDays, setRecurDays] = useState(booking.recurDays || []);           // selected weekday numbers
	const [recurEndDate, setRecurEndDate] = useState(booking.recurEndDate || '');           // YYYY-MM-DD

	// Time conversion helper functions
	const parse24To12 = (time24) => {
		if (!time24) return { hour12: '09', minute: '00', period: 'AM' };
		const [hStr, mStr] = time24.split(':');
		const h = parseInt(hStr, 10);
		const period = h >= 12 ? 'PM' : 'AM';
		const hour12Val = h % 12 || 12;
		return {
			hour12: String(hour12Val).padStart(2, '0'),
			minute: mStr || '00',
			period
		};
	};

	const format12To24 = (hour12, minute, period) => {
		let h = parseInt(hour12, 10);
		if (isNaN(h)) h = 12;
		if (h < 1) h = 1;
		if (h > 12) h = 12;

		if (period === 'PM' && h < 12) {
			h += 12;
		} else if (period === 'AM' && h === 12) {
			h = 0;
		}

		let m = parseInt(minute, 10);
		if (isNaN(m)) m = 0;
		if (m < 0) m = 0;
		if (m > 59) m = 59;

		const hStr = String(h).padStart(2, '0');
		const mStr = String(m).padStart(2, '0');
		return `${hStr}:${mStr}`;
	};

	// Initialize local 12h states from 24h props
	const initStart = useMemo(() => parse24To12(booking.startTime), [booking.startTime]);
	const [startHr, setStartHr] = useState(initStart.hour12);
	const [startMin, setStartMin] = useState(initStart.minute);
	const [startPeriod, setStartPeriod] = useState(initStart.period);

	const initEnd = useMemo(() => parse24To12(booking.endTime), [booking.endTime]);
	const [endHr, setEndHr] = useState(initEnd.hour12);
	const [endMin, setEndMin] = useState(initEnd.minute);
	const [endPeriod, setEndPeriod] = useState(initEnd.period);

	// Time options 
	const timeOptions = useMemo(() => bookingService.generateTimeOptions(), []);

	const handleStartHrChange = (val) => {
		const clean = val.replace(/\D/g, '').slice(0, 2);
		setStartHr(clean);
		
		const hVal = parseInt(clean, 10);
		if (!isNaN(hVal) && hVal >= 1 && hVal <= 12) {
			const newStart = format12To24(clean, startMin, startPeriod);
			setStartTime(newStart);
			if (endTime <= newStart) {
				const idx = timeOptions.indexOf(newStart);
				const fallbackEnd = timeOptions[idx + 1] || '23:45';
				setEndTime(fallbackEnd);
				const end12 = parse24To12(fallbackEnd);
				setEndHr(end12.hour12);
				setEndMin(end12.minute);
				setEndPeriod(end12.period);
			}
		}
	};

	const handleStartMinChange = (val) => {
		const clean = val.replace(/\D/g, '').slice(0, 2);
		setStartMin(clean);

		const mVal = parseInt(clean, 10);
		if (!isNaN(mVal) && mVal >= 0 && mVal <= 59) {
			const newStart = format12To24(startHr, clean, startPeriod);
			setStartTime(newStart);
			if (endTime <= newStart) {
				const idx = timeOptions.indexOf(newStart);
				const fallbackEnd = timeOptions[idx + 1] || '23:45';
				setEndTime(fallbackEnd);
				const end12 = parse24To12(fallbackEnd);
				setEndHr(end12.hour12);
				setEndMin(end12.minute);
				setEndPeriod(end12.period);
			}
		}
	};

	const toggleStartPeriod = () => {
		const newPeriod = startPeriod === 'AM' ? 'PM' : 'AM';
		setStartPeriod(newPeriod);
		const newStart = format12To24(startHr, startMin, newPeriod);
		setStartTime(newStart);
		if (endTime <= newStart) {
			const idx = timeOptions.indexOf(newStart);
			const fallbackEnd = timeOptions[idx + 1] || '23:45';
			setEndTime(fallbackEnd);
			const end12 = parse24To12(fallbackEnd);
			setEndHr(end12.hour12);
			setEndMin(end12.minute);
			setEndPeriod(end12.period);
		}
	};

	const handleEndHrChange = (val) => {
		const clean = val.replace(/\D/g, '').slice(0, 2);
		setEndHr(clean);

		const hVal = parseInt(clean, 10);
		if (!isNaN(hVal) && hVal >= 1 && hVal <= 12) {
			const newEnd = format12To24(clean, endMin, endPeriod);
			setEndTime(newEnd);
		}
	};

	const handleEndMinChange = (val) => {
		const clean = val.replace(/\D/g, '').slice(0, 2);
		setEndMin(clean);

		const mVal = parseInt(clean, 10);
		if (!isNaN(mVal) && mVal >= 0 && mVal <= 59) {
			const newEnd = format12To24(endHr, clean, endPeriod);
			setEndTime(newEnd);
		}
	};

	const toggleEndPeriod = () => {
		const newPeriod = endPeriod === 'AM' ? 'PM' : 'AM';
		setEndPeriod(newPeriod);
		const newEnd = format12To24(endHr, endMin, newPeriod);
		setEndTime(newEnd);
	};

	const handleStartHrBlur = () => {
		let h = parseInt(startHr, 10);
		if (isNaN(h) || h < 1 || h > 12) h = 12;
		const padded = String(h).padStart(2, '0');
		setStartHr(padded);
		const newStart = format12To24(padded, startMin, startPeriod);
		setStartTime(newStart);
	};

	const handleStartMinBlur = () => {
		let m = parseInt(startMin, 10);
		if (isNaN(m) || m < 0 || m > 59) m = 0;
		const padded = String(m).padStart(2, '0');
		setStartMin(padded);
		const newStart = format12To24(startHr, padded, startPeriod);
		setStartTime(newStart);
	};

	const handleEndHrBlur = () => {
		let h = parseInt(endHr, 10);
		if (isNaN(h) || h < 1 || h > 12) h = 12;
		const padded = String(h).padStart(2, '0');
		setEndHr(padded);
		const newEnd = format12To24(padded, endMin, endPeriod);
		setEndTime(newEnd);
	};

	const handleEndMinBlur = () => {
		let m = parseInt(endMin, 10);
		if (isNaN(m) || m < 0 || m > 59) m = 0;
		const padded = String(m).padStart(2, '0');
		setEndMin(padded);
		const newEnd = format12To24(endHr, padded, endPeriod);
		setEndTime(newEnd);
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
			// Update the booking, including recurrence info if set
			bookingService.updateBooking(booking.id, {
				roomId: selectedRoom,
				date,
				startTime,
				endTime,
				title,
				newAttendees: newAttendeeList,
				isRecurring,
				recurDays,
				recurEndDate,
			});

			setSuccessMsg('✓ Meeting updated successfully.');
			setTimeout(() => onSave(), 1000);
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
						<MiniCalendar
							value={date}
							onChange={setDate}
						/>
					</div>

					{/* Start / End time row */}
					<div className="form-row">
						<div className="form-group">
							<label>Start Time</label>
							<div className="time-input-group">
								<input
									type="text"
									className="time-num-input"
									value={startHr}
									onChange={(e) => handleStartHrChange(e.target.value)}
									onBlur={handleStartHrBlur}
									placeholder="HH"
									maxLength={2}
								/>
								<span className="time-separator">:</span>
								<input
									type="text"
									className="time-num-input"
									value={startMin}
									onChange={(e) => handleStartMinChange(e.target.value)}
									onBlur={handleStartMinBlur}
									placeholder="MM"
									maxLength={2}
								/>
								<button
									type="button"
									className="time-ampm-btn"
									onClick={toggleStartPeriod}
								>
									{startPeriod}
								</button>
							</div>
						</div>
						<div className="form-group">
							<label>End Time</label>
							<div className="time-input-group">
								<input
									type="text"
									className="time-num-input"
									value={endHr}
									onChange={(e) => handleEndHrChange(e.target.value)}
									onBlur={handleEndHrBlur}
									placeholder="HH"
									maxLength={2}
								/>
								<span className="time-separator">:</span>
								<input
									type="text"
									className="time-num-input"
									value={endMin}
									onChange={(e) => handleEndMinChange(e.target.value)}
									onBlur={handleEndMinBlur}
									placeholder="MM"
									maxLength={2}
								/>
								<button
									type="button"
									className="time-ampm-btn"
									onClick={toggleEndPeriod}
								>
									{endPeriod}
								</button>
							</div>
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
									<MiniCalendar
										value={recurEndDate}
										onChange={setRecurEndDate}
										minDate={date}
										dropUp
									/>
								</div>

								{/* Summary preview */}
								{recurDays.length > 0 && recurEndDate && (
									<div className="ebm-recur-summary">
										Repeats every&nbsp;
										<strong>
											{recurDays
												.sort((a, b) => a - b)
												.map((d) => WEEKDAYS.find((w) => w.value === d)?.label)
												.join(', ')}
										</strong>
										&nbsp;until&nbsp;<strong>{bookingService.formatDateToDisplay(recurEndDate)}</strong>
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
