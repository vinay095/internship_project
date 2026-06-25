import { useState } from 'react';
import { roomService } from '../services/roomService';
import { LOCATIONS } from '../data/mock_data';
//import './ManageRooms.css';

function ManageRooms() {
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [showForm, setShowForm] = useState(false);
	const [editingRoom, setEditingRoom] = useState(null);
	const [, forceUpdate] = useState(0);

	// Form state
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [capacity, setCapacity] = useState('');
	const [amenities, setAmenities] = useState('');

	const allRooms = roomService.getAllRooms();

	const resetForm = () => {
		setName('');
		setLocation('');
		setCapacity('');
		setAmenities('');
		setEditingRoom(null);
		setShowForm(false);
	};

	const handleEdit = (room) => {
		setName(room.name);
		setLocation(room.location);
		setCapacity(room.capacity.toString());
		setAmenities(room.amenities.join(', '));
		setEditingRoom(room);
		setShowForm(true);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		if (!name.trim() || !location || !capacity) {
			setError('Please fill all required fields');
			return;
		}

		const amenityList = amenities.split(',').map((a) => a.trim()).filter(Boolean);

		try {
			if (editingRoom) {
				roomService.updateRoom(editingRoom.id, {name: name.trim(), location, capacity: Number(capacity), amenities: amenityList,});
				setMessage('Room updated successfully!');
			} else {
				roomService.createRoom({name: name.trim(), location, capacity: Number(capacity), amenities: amenityList,});
				setMessage('Room created successfully!');
			}

			resetForm();
			forceUpdate((n) => n + 1);
			setTimeout(() => setMessage(''), 3000);
		} catch (err) {
			setError(err.message);
		}
	};

	const handleToggleActive = (room) => {
		try {
			if (room.isActive) {
				roomService.deactivateRoom(room.id);
				setMessage(`"${room.name}" deactivated`);
			} 
			else {
				roomService.activateRoom(room.id);
				setMessage(`"${room.name}" activated`);
			}
			forceUpdate((n) => n + 1);
			setTimeout(() => setMessage(''), 3000);
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="manage-rooms-page">
		<div className="page-header">
			<h1>Manage Meeting Rooms</h1>
			<div className="page-actions">
			<button
				className="btn btn-primary"
				onClick={() => {
				resetForm();
				setShowForm(!showForm);
				}}
			>
				{showForm ? 'Cancel' : '+ Add Room'}
			</button>
			</div>
		</div>

		{message && <div className="form-success" style={{ marginBottom: 16 }}>{message}</div>}
		{error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

		{showForm && (
			<div className="room-form-card">
			<h2>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
			<form onSubmit={handleSubmit}>
				<div className="form-row">
				<div className="form-group">
					<label>Room Name *</label>
					<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Everest"
					required
					/>
				</div>
				<div className="form-group">
					<label>Location *</label>
					<select value={location} onChange={(e) => setLocation(e.target.value)} required>
					<option value="">Select Location</option>
					{LOCATIONS.map((loc) => (
						<option key={loc} value={loc}>{loc}</option>
					))}
					</select>
				</div>
				</div>

				<div className="form-row">
				<div className="form-group">
					<label>Capacity *</label>
					<input
					type="number"
					value={capacity}
					onChange={(e) => setCapacity(e.target.value)}
					placeholder="e.g. 10"
					min="1"
					required
					/>
				</div>
				<div className="form-group">
					<label>Amenities (comma-separated)</label>
					<input
					type="text"
					value={amenities}
					onChange={(e) => setAmenities(e.target.value)}
					placeholder="e.g. Projector, Whiteboard, TV Screen"
					/>
				</div>
				</div>

				<div className="form-actions">
				<button type="button" className="btn btn-secondary" onClick={resetForm}>
					Cancel
				</button>
				<button type="submit" className="btn btn-primary">
					{editingRoom ? 'Update Room' : 'Create Room'}
				</button>
				</div>
			</form>
			</div>
		)}

		<div className="rooms-table-wrapper">
			<table className="bookings-table">
			<thead>
				<tr>
				<th>Name</th>
				<th>Location</th>
				<th>Capacity</th>
				<th>Amenities</th>
				<th>Status</th>
				<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{allRooms.map((room) => (
				<tr key={room.id} className={!room.isActive ? 'row-inactive' : ''}>
					<td><strong>{room.name}</strong></td>
					<td>{room.location}</td>
					<td>{room.capacity}</td>
					<td>
					<div className="amenities-cell">
						{room.amenities.map((a) => (
						<span key={a} className="amenity-tag">{a}</span>
						))}
					</div>
					</td>
					<td>
					<span className={`room-status ${room.isActive ? 'active' : 'inactive'}`}>
						{room.isActive ? 'Active' : 'Inactive'}
					</span>
					</td>
					<td>
					<div className="action-btns">
						<button
						className="btn btn-small btn-secondary"
						onClick={() => handleEdit(room)}
						>
						Edit
						</button>
						<button
						className={`btn btn-small ${room.isActive ? 'btn-danger' : 'btn-primary'}`}
						onClick={() => handleToggleActive(room)}
						>
						{room.isActive ? 'Deactivate' : 'Activate'}
						</button>
					</div>
					</td>
				</tr>
				))}
			</tbody>
			</table>
		</div>
		</div>
	);
}

export default ManageRooms;
