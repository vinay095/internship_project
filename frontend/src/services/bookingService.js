import { bookings, generateId } from '../data/mockData';

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

		// sort by date and time
		result.sort((a, b) => {
			if (a.date !== b.date) return a.date.localeCompare(b.date);
			return a.timeSlot.localeCompare(b.timeSlot);
		});

		return result;
	},

	createBooking: ({ roomId, bookedBy, date, timeSlot, title, attendees }) => {
		// check conflict
		// for every booking b, find whether this booking matches 
		const conflict = bookings.find((b) => b.roomId === roomId && b.date === date && b.timeSlot === timeSlot);
		if (conflict) {
			throw new Error('This time slot is already booked');
		}

		const newBooking = {
			id: generateId('b'), roomId, bookedBy, date, timeSlot, title: title || 'Meeting', attendees: attendees || [], 
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

	sendInvites: (bookingId, emails) => {
		// replace later
		const booking = bookings.find((b) => b.id === bookingId);
		if (!booking) throw new Error('Booking not found');

		console.log(`[Email] Sending invites for "${booking.title}" to:`, emails);

		const newEmails = emails.filter((e) => !booking.attendees.includes(e));
		booking.attendees = [...booking.attendees, ...newEmails];

		return { success: true, sentTo: emails };
	},

	getBookedSlots: (roomId, date) => {
		return bookings.filter((b) => b.roomId === roomId && b.date === date).map((b) => b.timeSlot);
	},
};

export default bookingService;
