import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import EditBookingModal from '../components/EditBookingModal';
import { HugeiconsIcon } from '@hugeicons/react'
import { CalendarDownload01Icon, Delete02Icon, Edit04Icon, } from '@hugeicons/core-free-icons'

import './Bookings.css';

function Bookings() {
	const { user } = useAuth();
	const { showToast, showConfirm } = useToast();
	const [editBooking, setEditBooking] = useState(null);
	const [, forceUpdate] = useState(0);

	const bookings = bookingService.getBookings({});

	const handleUpdate = () => {
		setEditBooking(null);
		showToast('Booking updated successfully!', 'success');
		forceUpdate((n) => n + 1);
	};

	const handleCancel = async (bookingId) => {
		const ok = await showConfirm('Are you sure you want to cancel this booking?');
		if (ok) {
			try {
				bookingService.cancelBooking(bookingId);
				showToast('Booking cancelled', 'info');
				forceUpdate((n) => n + 1);
			} catch (err) {
				showToast(err.message, 'error');
			}
		}
	};

	// Download an .ics calendar file for the booking — 100% frontend, no backend needed
	const handleAddToCalendar = (booking) => {
		const room = roomService.getRoomById(booking.roomId);
		bookingService.downloadICS(booking, room);
	};

	return (
		<div className="bookings-page">
			<div className="page-header">
				<h1>All Bookings</h1>
			</div>

			{bookings.length === 0 ? (
				<div className="empty-state"><p>No bookings yet</p></div>) : (
				<div className="bookings-table-wrapper">
					<table className="bookings-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Time</th>
								<th>Room</th>
								<th>Title</th>
								<th>Booked By</th>
								<th>Attendees</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{bookings.map((b) => {
								const room = roomService.getRoomById(b.roomId);
								const booker = authService.getUserById(b.bookedBy);
								const isOwner = b.bookedBy === user.id;

								// Format time — supports both new startTime/endTime and old timeSlot string
								const timeDisplay = b.startTime && b.endTime
									? `${bookingService.formatTime(b.startTime)} – ${bookingService.formatTime(b.endTime)}`
									: b.timeSlot || '—';

								const duration = b.startTime && b.endTime
									? bookingService.getDurationLabel(b.startTime, b.endTime)
									: null;

								return (
									<tr key={b.id}>
										<td>
											{bookingService.formatDateToDisplay(b.date)}
											{b.isRecurring && b.recurDays && (
												<div className="recurring-badge">
													↻ {['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
														.filter((_, i) => b.recurDays.includes(i))
														.join(', ')}
													{b.recurEndDate && <span className="recur-until"> until {bookingService.formatDateToDisplay(b.recurEndDate)}</span>}
												</div>
											)}
										</td>
										<td>
											<span className="booking-time">{timeDisplay}</span>
											{duration && <span className="booking-duration">{duration}</span>}
										</td>
										<td>
											<strong>{room?.name}</strong>
											<br />
											<span className="text-muted">{room?.location}</span>
										</td>
										<td>{b.title}</td>
										<td>
											<span className="booker-name">{booker?.name || 'Unknown'}</span>
											<br />
											<span className="text-muted">{booker?.role}</span>
										</td>
										<td>
											{b.attendees.length > 0 ? (
												<span className="attendee-count">
													{b.attendees.length} attendee(s)
												</span>
											) : (
												<span className="text-muted">None</span>
											)}
										</td>
										<td>
											<div className="action-btns">
												{/* "Add to Calendar" available for all bookings the user can see */}
												<button
													className="action-btn btn-ics"
													onClick={() => handleAddToCalendar(b)}
													title="Download .ics"
												>
													<HugeiconsIcon icon={CalendarDownload01Icon} />
												</button>

												{isOwner && (
													<>
														<button
															className="action-btn btn-edit"
															onClick={() => setEditBooking(b)}
															title="Edit Meeting Info"
														>
															<HugeiconsIcon icon={Edit04Icon} />
														</button>
														<button
															className="action-btn btn-cancel"
															onClick={() => handleCancel(b.id)}
															title="Cancel Meeting"
														>
															<HugeiconsIcon icon={Delete02Icon} />
														</button>
													</>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{editBooking && (
				<EditBookingModal
					booking={editBooking}
					onClose={() => setEditBooking(null)}
					onSave={handleUpdate}
				/>
			)}
		</div>
	);
}

export default Bookings;
