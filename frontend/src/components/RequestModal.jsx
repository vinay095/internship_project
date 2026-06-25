import { useState } from 'react';
import { TIME_SLOTS } from '../data/mock_data';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
//import './BookingModal.css';

function RequestModal({ room, bookedSlots = [], onClose, onRequest }) {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [managerId, setManagerId] = useState(user?.reportingManagerId || '');
  const [error, setError] = useState('');

  const managers = authService.getManagers();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a meeting title');
      return;
    }
    if (!managerId) {
      setError('Please select a manager');
      return;
    }

    onRequest({
      roomId: room.id,
      managerId,
      date,
      timeSlot,
      title: title.trim(),
      note: note.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Booking: {room.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Request to (Manager)</label>
            <select value={managerId} onChange={(e) => setManagerId(e.target.value)}>
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role}) - {m.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Time Slot</label>
            <div className="slot-grid">
              {TIME_SLOTS.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-btn ${isBooked ? 'booked' : ''} ${timeSlot === slot ? 'selected' : ''}`}
                    disabled={isBooked}
                    onClick={() => setTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Meeting Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Team Sync"
            />
          </div>

          <div className="form-group">
            <label>Note to Manager (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional details..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestModal;
