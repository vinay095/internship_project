import './RoomCard.css';

function RoomCard({ room, bookedSlots = [], onBook, onRequest, canBook }) {
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

      {bookedSlots.length > 0 && (
        <div className="room-booked-slots">
          <span className="booked-label">Booked today:</span>
          {bookedSlots.map((slot) => (
            <span key={slot} className="booked-slot">{slot}</span>
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
