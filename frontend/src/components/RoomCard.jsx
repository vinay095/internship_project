import RoomTimeline from './RoomTimeline';
import { bookingService } from '../services/bookingService';
import './RoomCard.css';

// Old prop: bookedSlots (string array of TIME_SLOTS)
// New prop: bookedRanges ({startTime, endTime, title}[]) for dynamic slot support

function RoomCard({ room, bookedRanges = [], onBook, onRequest, canBook }) {
  return (
    <div className={`room-card ${!room.isActive ? 'room-inactive' : ''}`}>
      <div className="room-card-header">
        <h3 className="room-name">{room.name}</h3>
        <span className={`room-status ${room.isActive ? 'active' : 'inactive'}`}>
          {room.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="room-meta">
        <span className="room-location"> {room.location}</span>
        <span className="room-capacity"> {room.capacity} people</span>
      </div>

      <div className="room-amenities">
        {room.amenities.map((a) => (
          <span key={a} className="amenity-tag">{a}</span>
        ))}
      </div>

      {/* 24-hour visual timeline showing today's booked ranges */}
      <RoomTimeline bookedRanges={bookedRanges} canBook={canBook} />

      {/* Compact booked time labels below the timeline */}
      {bookedRanges.length > 0 && (
        <div className="room-booked-slots">
          <span className="booked-label">Booked today:</span>
          {bookedRanges.map((r, i) => (
            <span key={i} className="booked-slot">
              {bookingService.formatTime(r.startTime)}–{bookingService.formatTime(r.endTime)}
            </span>
          ))}
        </div>
      )}

      {room.isActive && (
        <div className="room-card-actions">
          {canBook ? (
            <button className="btn btn-primary" onClick={() => onBook(room)}>
              Book Room
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => onRequest(room)}>
              Request Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomCard;
