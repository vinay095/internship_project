import { rooms, generateId } from '../data/mock_data';

export const roomService = {
	getRooms: (location = null) => {
		let result = rooms.filter((r) => r.isActive);	// get all active rooms
		if (location) {
			result = result.filter((r) => r.location === location);
		}
		return result;
	},

	getAllRooms: () => {
		return [...rooms];
	},

	getRoomById: (id) => {
		return rooms.find((r) => r.id === id) || null;
	},

	createRoom: ({ name, location, capacity, amenities }) => {
		const newRoom = {
			id: generateId('r'), name, location, capacity: Number(capacity), amenities: amenities || [], isActive: true,
		};
		rooms.push(newRoom); // add to room array
		return newRoom;
	},

	updateRoom: (id, updates) => {	// upadte is change in room properties like roomId, amenities, etc
		const index = rooms.findIndex((r) => r.id === id);
		if (index === -1) throw new Error('Room not found');
		rooms[index] = { ...rooms[index], ...updates };	// update the room properties
		return rooms[index];
	},

	deactivateRoom: (id) => {
		const index = rooms.findIndex((r) => r.id === id);
		if (index === -1) throw new Error('Room not found');
		rooms[index].isActive = false;
		return rooms[index];
	},

	activateRoom: (id) => {
		const index = rooms.findIndex((r) => r.id === id);
		if (index === -1) throw new Error('Room not found');
		rooms[index].isActive = true;
		return rooms[index];
	},
};

export default roomService;
