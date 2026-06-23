
// mock data, will be replaced by api calls

export const LOCATIONS = ['NOIDA', 'HYDERABAD', 'KOLKATA']

export const TIME_SLOTS = ['9 AM - 10 AM', '10 AM - 11 AM', '11 AM - 12 PM', '12 PM - 1 PM', '1 PM - 2 PM', '2 PM - 3 PM', '3 PM - 4 PM', '4 PM - 5 PM']

//export let USERS = {
//	{id: "user1", name: "Vinay"},

//	{id: "user2", name: "Akash"}
//}
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

const today = new Date().toISOString().split('T')[0];

export let bookings = [
	{
		id: 'book1',
		roomId: 'room1',
		bookedBy: 'u2',
		date: today,
		timeSlot: '10:00 - 11:00',
		title: 'Sprint Planning',
		attendees: ['u3', 'u2'],
		createdAt: new Date().toISOString(),
	},
];

export let requests = [
	{
		id: 'req1',
		requestedBy: 'u4',
		managerId: 'u2',
		roomId: 'r1',
		date: today,
		timeSlot: '15:00 - 16:00',
		title: 'Team Sync',
		note: 'Need room for quick team sync',
		status: 'pending', // pending | approved | rejected
		createdAt: new Date().toISOString(),
	},
];

// helper to generate unique IDs
let idCounter = 100;
export const generateId = (prefix) => `${prefix}${++idCounter}`;
