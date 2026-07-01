import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { roomService } from '../services/roomService';
import { bookingService } from '../services/bookingService';
import { requestService } from '../services/requestService';
import { useToast } from '../contexts/ToastContext';
import { LOCATIONS } from '../data/mock_data';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import RequestModal from '../components/RequestModal';
import './Rooms.css';

function Rooms() {
	const { user, hasRole } = useAuth();
	const { showToast } = useToast();
	// admin can browse all locations; employees and managers are locked to their own
	const isAdmin = hasRole('admin');
	const [selectedLocation, setSelectedLocation] = useState(user.location);
	const [bookingRoom, setBookingRoom] = useState(null);
	const [requestRoom, setRequestRoom] = useState(null);
	const [, forceUpdate] = useState(0);

	const rooms = roomService.getRooms(selectedLocation);
	const today = bookingService.getLocalDateString();
	const canBook = hasRole('manager');

	const handleBook = (data) => {
		try {
			bookingService.createBooking({ ...data, bookedBy: user.id });
			setBookingRoom(null);
			showToast('Room booked successfully!', 'success');
			forceUpdate((n) => n + 1);
		} catch (err) {
			showToast(err.message, 'error');
		}
	};

	const handleRequest = (data) => {
		try {
			requestService.createRequest({ ...data, requestedBy: user.id });
			setRequestRoom(null);
			showToast('Booking request sent to your manager!', 'success');
			forceUpdate((n) => n + 1);
		} catch (err) {
			showToast(err.message, 'error');
		}
	};

	return (
		<div className="rooms-page">
			<div className="page-header">
				<h1>Meeting Rooms</h1>
				<div className="page-actions">
					{isAdmin ? (
						/* admin can switch between all locations */
						<select
							value={selectedLocation}
							onChange={(e) => setSelectedLocation(e.target.value)}
							className="location-select"
						>
							{LOCATIONS.map((loc) => (
								<option key={loc} value={loc}>{loc}</option>
							))}
						</select>
					) : (
						/* Employees and Managers are locked to their own location */
						<span className="location-badge">{user.location}</span>
					)}
				</div>
			</div>

			<div className="rooms-grid">
				{rooms.map((room) => {
					// Updated: getBookedRanges returns [{startTime, endTime, title}] for the timeline
					// Old: bookingService.getBookedSlots(room.id, today) returned string[]
					const bookedRanges = bookingService.getBookedRanges(room.id, today);
					return (
						<RoomCard
							key={room.id}
							room={room}
							bookedRanges={bookedRanges}
							canBook={canBook}
							onBook={setBookingRoom}
							onRequest={setRequestRoom}
						/>
					);
				})}
			</div>

			{rooms.length === 0 && (
				<div className="empty-state">
					<p>No active rooms at {selectedLocation}</p>
				</div>
			)}

			{bookingRoom && (
				<BookingModal
					room={bookingRoom}
					onClose={() => setBookingRoom(null)}
					onBook={handleBook}
				/>
			)}

			{requestRoom && (
				<RequestModal
					room={requestRoom}
					onClose={() => setRequestRoom(null)}
					onRequest={handleRequest}
				/>
			)}
		</div>
	);
}

export default Rooms;
