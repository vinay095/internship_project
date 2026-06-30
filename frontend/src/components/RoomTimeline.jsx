import { bookingService } from '../services/bookingService';
import './RoomTimeline.css';

/**
 * RoomTimeline - A 24-hour horizontal visual timeline for a room's daily schedule.
 * Booked ranges are rendered as colored blocks positioned using CSS percentage widths.
 */
function RoomTimeline({ bookedRanges = [], onSlotClick, canBook }) {
	const TOTAL_MINUTES = 24 * 60; // 1440 minutes in a day

	const toPercent = (time) =>
		(bookingService.timeToMinutes(time) / TOTAL_MINUTES) * 100;

	const widthPercent = (start, end) =>
		((bookingService.timeToMinutes(end) - bookingService.timeToMinutes(start)) / TOTAL_MINUTES) * 100;

	// Hour markers shown on the axis
	const hourMarkers = [0, 3, 6, 9, 12, 15, 18, 21, 24];

	return (
		<div className="room-timeline">
			{/* Hour axis labels */}
			<div className="timeline-axis">
				{hourMarkers.map((h) => (
					<span
						key={h}
						className="timeline-hour-label"
						style={{ left: `${(h / 24) * 100}%` }}
					>
						{h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h}AM` : `${h - 12}PM`}
					</span>
				))}
			</div>

			{/* Timeline track */}
			<div className="timeline-track">
				{/* Subtle hour dividers */}
				{[...Array(25)].map((_, h) => (
					<div
						key={h}
						className="timeline-divider"
						style={{ left: `${(h / 24) * 100}%` }}
					/>
				))}

				{/* Booked range blocks */}
				{bookedRanges.map((range, i) => (
					<div
						key={i}
						className="timeline-block booked"
						title={`${range.title}: ${bookingService.formatTime(range.startTime)} – ${bookingService.formatTime(range.endTime)}`}
						style={{
							left: `${toPercent(range.startTime)}%`,
							width: `${widthPercent(range.startTime, range.endTime)}%`,
						}}
					>
						<span className="timeline-block-label">{range.title}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default RoomTimeline;
