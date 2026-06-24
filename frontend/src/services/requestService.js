import { requests, bookings, generateId } from '../data/mockData';

export const requestService = {

	createRequest: ({ requestedBy, managerId, roomId, date, timeSlot, title, note }) => {
		const newRequest = {
			id: generateId('req'), requestedBy, managerId, roomId, date, timeSlot, title: title || 'Meeting',
			note: note || '', status: 'pending', createdAt: new Date().toISOString(),
		};

		requests.push(newRequest);
		return newRequest;
	},

	getMyRequests: (userId) => {
		return requests.filter((r) => r.requestedBy === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	},

	getPendingRequests: (managerId) => {
		return requests.filter((r) => r.managerId === managerId && r.status === 'pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	},

	getAllRequests: (managerId) => {
		return requests.filter((r) => r.managerId === managerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	},

	approveRequest: (requestId, managerId) => {
		const req = requests.find((r) => r.id === requestId);
		if (!req) throw new Error('Request not found');
		if (req.managerId !== managerId) throw new Error('Unauthorized');

		// chek if slot is available
		const conflict = bookings.find((b) => b.roomId === req.roomId && b.date === req.date && b.timeSlot === req.timeSlot);
		if (conflict) {
			throw new Error('Time slot is no longer available');
		}

		req.status = 'approved';

		// 
		const newBooking = {
			id: generateId('b'), roomId: req.roomId, bookedBy: managerId, date: req.date, timeSlot: req.timeSlot,
			title: req.title, attendees: [], createdAt: new Date().toISOString(),
		};
		bookings.push(newBooking);

		return { request: req, booking: newBooking };
	},

	rejectRequest: (requestId, managerId) => {
		const req = requests.find((r) => r.id === requestId);
		if (!req) throw new Error('Request not found');
		if (req.managerId !== managerId) throw new Error('Unauthorized');

		req.status = 'rejected';
		return req;
	},
};

export default requestService;
