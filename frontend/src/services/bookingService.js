import { bookings, generateId } from '../data/mock_data';
import { roomService } from './roomService';

// ─── Time utility helpers ──────────────────────────────────────────────────────

/**
 * Get local date string in YYYY-MM-DD format (timezone-safe).
 */
export const getLocalDateString = (d = new Date()) => {
	const offsetMs = d.getTimezoneOffset() * 60 * 1000;
	return new Date(d.getTime() - offsetMs).toISOString().split('T')[0];
};

/**
 * Convert "HH:MM" to total minutes since midnight.
 * e.g. "10:30" → 630
 */
export const timeToMinutes = (time) => {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
};

/**
 * Convert total minutes to "HH:MM" string.
 * e.g. 630 → "10:30"
 */
export const minutesToTime = (minutes) => {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Format "HH:MM" to a readable 12-hour string.
 * e.g. "14:30" → "2:30 PM"
 */
export const formatTime = (time) => {
	const [h, m] = time.split(':').map(Number);
	const period = h >= 12 ? 'PM' : 'AM';
	const hour12 = h % 12 || 12;
	return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Calculate duration label between two "HH:MM" strings.
 * e.g. ("10:00", "10:45") → "45 min"
 */
export const getDurationLabel = (startTime, endTime) => {
	const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
	if (diff <= 0) return '';
	if (diff < 60) return `${diff} min`;
	const hours = Math.floor(diff / 60);
	const mins = diff % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Generate list of time strings in 15-minute increments over a 24hr cycle.
 * e.g. ["00:00", "00:15", ..., "23:45"]
 */
export const generateTimeOptions = () => {
	const options = [];
	for (let min = 0; min < 24 * 60; min += 15) {
		options.push(minutesToTime(min));
	}
	return options;
};

/**
 * Check if two time ranges overlap.
 * Returns true if [start1, end1) overlaps with [start2, end2).
 */
export const timesOverlap = (start1, end1, start2, end2) => {
	return timeToMinutes(start1) < timeToMinutes(end2) &&
		timeToMinutes(start2) < timeToMinutes(end1);
};

// ─── ICS Calendar File Generator ─────────────────────────────────────────────

/**
 * Generate and download a standard iCalendar (.ics) file for a booking.
 * This is 100% client-side — no backend required.
 * @param {Object} booking - booking record
 * @param {Object} room - room record
 */
export const downloadICS = (booking, room) => {
	const dateStr = booking.date.replace(/-/g, ''); // "2026-06-29" → "20260629"
	const startStr = `${dateStr}T${booking.startTime.replace(':', '')}00`; // e.g. "20260629T100000"
	const endStr = `${dateStr}T${booking.endTime.replace(':', '')}00`;

	const uid = `${booking.id}-${dateStr}@mrbs.app`;
	const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

	const attendeeLines = booking.attendees
		.map((email) => `ATTENDEE;RSVP=TRUE:mailto:${email}`)
		.join('\r\n');

	const icsContent = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//MRBS//Meeting Room Booking System//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:REQUEST',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${now}`,
		`DTSTART:${startStr}`,
		`DTEND:${endStr}`,
		`SUMMARY:${booking.title}`,
		`LOCATION:${room ? room.name + ', ' + room.location : 'Meeting Room'}`,
		`DESCRIPTION:Meeting Room Booking\\nRoom: ${room?.name}\\nLocation: ${room?.location}`,
		attendeeLines,
		'STATUS:CONFIRMED',
		'END:VEVENT',
		'END:VCALENDAR',
	].filter(Boolean).join('\r\n');

	const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${booking.title.replace(/\s+/g, '_')}.ics`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

// ─── Booking Service ──────────────────────────────────────────────────────────

export const bookingService = {
	getBookings: (filters = {}) => {
		let result = [...bookings];

		if (filters.roomId) {
			result = result.filter((b) => b.roomId === filters.roomId);
		}
		if (filters.date) {
			result = result.filter((b) => b.date === filters.date);
		}
		if (filters.bookedBy) {
			result = result.filter((b) => b.bookedBy === filters.bookedBy);
		}

		// sort by date then start time
		result.sort((a, b) => {
			if (a.date !== b.date) return a.date.localeCompare(b.date);
			return a.startTime.localeCompare(b.startTime);
		});

		return result;
	},

	createBooking: ({ roomId, bookedBy, date, startTime, endTime, title, attendees }) => {
		// Validate time range
		if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
			throw new Error('End time must be after start time');
		}

		// Check for overlapping bookings on same room & date
		const conflict = bookings.find((b) =>
			b.roomId === roomId &&
			b.date === date &&
			timesOverlap(startTime, endTime, b.startTime, b.endTime)
		);
		if (conflict) {
			throw new Error(`This room is already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)}`);
		}

		const newBooking = {
			id: generateId('b'),
			roomId,
			bookedBy,
			date,
			startTime,
			endTime,
			title: title || 'Meeting',
			attendees: attendees || [],
			createdAt: new Date().toISOString(),
		};

		bookings.push(newBooking);
		return newBooking;
	},

	cancelBooking: (id) => {
		const index = bookings.findIndex((b) => b.id === id);
		if (index === -1) throw new Error('Booking not found');
		const removed = bookings.splice(index, 1);
		return removed[0];
	},

	/**
	 * Update an existing booking's room, date, time window, title, and/or attendees.
	 * Conflict check excludes the booking being edited (so its own slot is not a false clash).
	 */
	updateBooking: (id, { roomId, date, startTime, endTime, title, newAttendees = [] }) => {
		const index = bookings.findIndex((b) => b.id === id);
		if (index === -1) throw new Error('Booking not found');

		// Validate time order
		if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
			throw new Error('End time must be after start time');
		}

		// Check for conflicts in the target room/date, skipping this booking itself
		const conflict = bookings.find((b) =>
			b.id !== id &&
			b.roomId === roomId &&
			b.date === date &&
			b.startTime && b.endTime &&   // skip old-format bookings
			timesOverlap(startTime, endTime, b.startTime, b.endTime)
		);
		if (conflict) {
			throw new Error(
				`Room already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} — "${conflict.title}"`
			);
		}

		// Merge new attendees (no duplicates)
		const existing = bookings[index].attendees || [];
		const sanitized = newAttendees
			.map((e) => e.trim())
			.filter((e) => e && !existing.includes(e));

		bookings[index] = {
			...bookings[index],
			roomId,
			date,
			startTime,
			endTime,
			title: title.trim() || bookings[index].title,
			attendees: [...existing, ...sanitized],
			updatedAt: new Date().toISOString(),
		};
		return bookings[index];
	},

	/**
	 * Return all active rooms in a location with their availability status
	 * for a given [startTime, endTime) window on a specific date.
	 * excludeBookingId — the booking being edited, so it doesn't clash with itself.
	 */
	getRoomsStatus: (location, date, startTime, endTime, excludeBookingId = null) => {
		const rooms = roomService.getRooms(location);
		return rooms.map((room) => {
			const conflict = bookings.find((b) =>
				b.id !== excludeBookingId &&
				b.roomId === room.id &&
				b.date === date &&
				b.startTime && b.endTime &&   // skip old-format bookings with no time range
				timesOverlap(startTime, endTime, b.startTime, b.endTime)
			);
			return {
				room,
				isAvailable: !conflict,
				conflictTitle: conflict ? conflict.title : null,
			};
		});
	},

	sendInvites: (bookingId, emails) => {
		const booking = bookings.find((b) => b.id === bookingId);
		if (!booking) throw new Error('Booking not found');

		console.log(`[Email] Sending invites for "${booking.title}" to:`, emails);

		const newEmails = emails.filter((e) => !booking.attendees.includes(e));
		booking.attendees = [...booking.attendees, ...newEmails];

		return { success: true, sentTo: emails };
	},

	// Returns booked time range objects [{startTime, endTime}] for a given room+date.
	// Old method (getBookedSlots) returned flat slot strings for the fixed-slot grid buttons.
	// Old: getBookedSlots: (roomId, date) => bookings.filter(...).map(b => b.timeSlot)
	getBookedRanges: (roomId, date) => {
		return bookings
			.filter((b) => b.roomId === roomId && b.date === date)
			.map((b) => ({ startTime: b.startTime, endTime: b.endTime, title: b.title }));
	},

	// Re-export utilities so pages can import from one place
	downloadICS,
	formatTime,
	getDurationLabel,
	generateTimeOptions,
	timesOverlap,
	timeToMinutes,
	minutesToTime,
	getLocalDateString,
};

export default bookingService;
