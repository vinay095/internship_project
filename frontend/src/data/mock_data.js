
// mock data, will be replaced by api calls

export const LOCATIONS = ['Noida', 'Hyderabad', 'Kolkata']

// REMOVED: Fixed 1-hour TIME_SLOTS replaced by dynamic startTime/endTime per booking.
// The old slot grid buttons are replaced with 15-minute interval time pickers.
// export const TIME_SLOTS = ['9 AM - 10 AM', '10 AM - 11 AM', '11 AM - 12 PM', '12 PM - 1 PM', '1 PM - 2 PM', '2 PM - 3 PM', '3 PM - 4 PM', '4 PM - 5 PM']

export let users = [
	{ id: 'u1', name: 'Priya Sharma', email: 'priya@arrise.com', password: 'password123', role: 'hr', location: 'Noida', reportingManagerId: null },
	{ id: 'u2', name: 'Rahul Verma', email: 'rahul@arrise.com', password: 'password123', role: 'manager', location: 'Noida', reportingManagerId: 'u1' },
	{ id: "u3", name: "Vinay", email: "vinay@arrise.com", password: "password123", role: "employee", location: "Noida", reportingManagerId: "u2" }
];

export let rooms = [
	{ id: 'r1', name: 'Brahamputra', location: 'Noida', capacity: 16, amenities: ['TV Screen', 'Whiteboard', 'Video Conferencing'], isActive: true },
	{ id: 'r2', name: 'Himalaya', location: 'Hyderabad', capacity: 6, amenities: ['TV Screen'], isActive: true },
	{ id: 'r3', name: 'Aravalli', location: 'Kolkata', capacity: 12, amenities: ['Whiteboard', 'Projector'], isActive: true },
	{ id: 'r4', name: 'Ganga', location: 'Noida', capacity: 8, amenities: ['TV Screen', 'Whiteboard'], isActive: true },
	{ id: 'r5', name: 'Godavari', location: 'Kolkata', capacity: 8, amenities: ['TV Screen', 'Whiteboard'], isActive: true }
];

const getLocalDateString = (d = new Date()) => {
	const offsetMs = d.getTimezoneOffset() * 60 * 1000;
	return new Date(d.getTime() - offsetMs).toISOString().split('T')[0];
};
const today = getLocalDateString();

// BUG FIX (original): booking had roomId: 'room1' (no such room) and timeSlot in 24h format.
// BUG FIX (v2): migrated from timeSlot string to startTime + endTime for dynamic slot support.
// Old format: { timeSlot: '10 AM - 11 AM' }
// New format: { startTime: '10:00', endTime: '11:00' }
export let bookings = [
	{
		id: 'book1',
		roomId: 'r1',
		bookedBy: 'u2',
		date: today,
		startTime: '10:00',
		endTime: '11:00',
		title: 'Sprint Planning',
		attendees: ['vinay@arrise.com'],
		createdAt: new Date().toISOString(),
	},
	{
		id: 'book2',
		roomId: 'r4',
		bookedBy: 'u2',
		date: today,
		startTime: '14:00',
		endTime: '14:45',
		title: 'Quick Sync',
		attendees: [],
		createdAt: new Date().toISOString(),
	},
];

// BUG FIX (original): request had requestedBy: 'u4' (no such user) and timeSlot in 24h format.
// BUG FIX (v2): migrated from timeSlot string to startTime + endTime.
export let requests = [
	{
		id: 'req1',
		requestedBy: 'u3',
		managerId: 'u2',
		roomId: 'r1',
		date: today,
		startTime: '15:00',
		endTime: '16:00',
		title: 'Team Sync',
		note: 'Need room for quick team sync',
		status: 'pending', // pending | approved | rejected
		createdAt: new Date().toISOString(),
	},
];

// helper to generate unique IDs
let idCounter = 100;
export const generateId = (prefix) => `${prefix}${++idCounter}`;
