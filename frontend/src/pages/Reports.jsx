import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import './Reports.css';

// Working hours assumed for utilization rate calculation
const WORKDAY_MINUTES = 24 * 60; // 24-hour cycle

function Reports() {
	const { user } = useAuth();
	const allBookings = bookingService.getBookings({});
	const allRooms = roomService.getAllRooms();

	// ─── Per-room stats ───────────────────────────────────────────────────────
	const roomStats = useMemo(() => {
		return allRooms.map((room) => {
			const roomBookings = allBookings.filter((b) => b.roomId === room.id);

			// Total booked minutes across all days
			const totalMinutes = roomBookings.reduce((acc, b) => {
				if (!b.startTime || !b.endTime) return acc;
				return acc + (bookingService.timeToMinutes(b.endTime) - bookingService.timeToMinutes(b.startTime));
			}, 0);

			// Unique booking dates for this room
			const uniqueDays = new Set(roomBookings.map((b) => b.date)).size;

			// Utilization: minutes booked / (days * WORKDAY_MINUTES)
			const utilization = uniqueDays > 0
				? Math.min(100, Math.round((totalMinutes / (uniqueDays * WORKDAY_MINUTES)) * 100))
				: 0;

			return {
				room,
				totalBookings: roomBookings.length,
				totalMinutes,
				uniqueDays,
				utilization,
			};
		});
	}, [allBookings, allRooms]);

	// ─── Peak hours distribution (hourly buckets) ────────────────────────────
	const peakHours = useMemo(() => {
		const buckets = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
		allBookings.forEach((b) => {
			if (!b.startTime || !b.endTime) return;
			const startH = Math.floor(bookingService.timeToMinutes(b.startTime) / 60);
			const endH = Math.ceil(bookingService.timeToMinutes(b.endTime) / 60);
			for (let h = startH; h < endH; h++) {
				if (h < 24) buckets[h].count++;
			}
		});
		return buckets;
	}, [allBookings]);

	const maxPeakCount = Math.max(...peakHours.map((b) => b.count), 1);

	// ─── Location summary ─────────────────────────────────────────────────────
	const locationStats = useMemo(() => {
		const map = {};
		allRooms.forEach((r) => {
			if (!map[r.location]) map[r.location] = { location: r.location, rooms: 0, bookings: 0 };
			map[r.location].rooms++;
		});
		allBookings.forEach((b) => {
			const room = allRooms.find((r) => r.id === b.roomId);
			if (room && map[room.location]) map[room.location].bookings++;
		});
		return Object.values(map);
	}, [allBookings, allRooms]);

	const formatMinutes = (mins) => {
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
	};

	return (
		<div className="reports-page">
			<div className="page-header">
				<h1>Utilization Reports</h1>
				<p className="page-subtitle">Room usage analytics based on current booking data</p>
			</div>

			{/* ─── Location Summary ─── */}
			<div className="reports-section">
				<h2 className="reports-section-title">Location Overview</h2>
				<div className="stats-grid">
					{locationStats.map((loc) => (
						<div key={loc.location} className="stat-card">
							<div className="stat-number">{loc.bookings}</div>
							<div className="stat-label">{loc.location} Bookings</div>
							<div className="stat-sub">{loc.rooms} rooms</div>
						</div>
					))}
					<div className="stat-card">
						<div className="stat-number">{allBookings.length}</div>
						<div className="stat-label">Total Bookings</div>
						<div className="stat-sub">across all rooms</div>
					</div>
				</div>
			</div>

			{/* ─── Room Utilization Bars ─── */}
			<div className="reports-section">
				<h2 className="reports-section-title">Room Utilization</h2>
				<div className="report-card">
					<p className="report-card-note">
						Utilization = total booked time ÷ total available time (24hr cycle per unique day)
					</p>
					<div className="utilization-list">
						{roomStats.map(({ room, totalBookings, totalMinutes, utilization }) => (
							<div key={room.id} className="util-row">
								<div className="util-room-info">
									<span className="util-room-name">{room.name}</span>
									<span className="util-room-location">{room.location}</span>
									<span className={`room-status ${room.isActive ? 'active' : 'inactive'}`} style={{ fontSize: 11 }}>
										{room.isActive ? 'Active' : 'Inactive'}
									</span>
								</div>
								<div className="util-bar-wrapper">
									<div
										className="util-bar"
										style={{ width: `${utilization}%` }}
										title={`${utilization}% utilization`}
									/>
								</div>
								<div className="util-meta">
									<span className="util-pct">{utilization}%</span>
									<span className="util-detail">
										{totalBookings} booking{totalBookings !== 1 ? 's' : ''} · {formatMinutes(totalMinutes)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ─── Peak Hours Chart ─── */}
			<div className="reports-section">
				<h2 className="reports-section-title">Peak Booking Hours (24hr)</h2>
				<div className="report-card">
					<div className="peak-chart">
						{peakHours.map(({ hour, count }) => {
							const heightPct = count > 0 ? Math.max(4, Math.round((count / maxPeakCount) * 100)) : 2;
							const label = hour === 0 ? '12a' : hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`;
							return (
								<div key={hour} className="peak-bar-col" title={`${label}: ${count} booking${count !== 1 ? 's' : ''}`}>
									<div
										className={`peak-bar ${count === 0 ? 'peak-bar-empty' : ''}`}
										style={{ height: `${heightPct}%` }}
									/>
									{hour % 3 === 0 && (
										<span className="peak-hour-label">{label}</span>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* ─── Detailed table ─── */}
			<div className="reports-section">
				<h2 className="reports-section-title">Room Detail Table</h2>
				<div className="bookings-table-wrapper">
					<table className="bookings-table">
						<thead>
							<tr>
								<th>Room</th>
								<th>Location</th>
								<th>Capacity</th>
								<th>Status</th>
								<th>Bookings</th>
								<th>Total Booked Time</th>
								<th>Utilization</th>
							</tr>
						</thead>
						<tbody>
							{roomStats.map(({ room, totalBookings, totalMinutes, utilization }) => (
								<tr key={room.id} className={!room.isActive ? 'row-inactive' : ''}>
									<td><strong>{room.name}</strong></td>
									<td>{room.location}</td>
									<td>{room.capacity} people</td>
									<td>
										<span className={`room-status ${room.isActive ? 'active' : 'inactive'}`}>
											{room.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td>{totalBookings}</td>
									<td>{formatMinutes(totalMinutes)}</td>
									<td>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<div className="mini-bar-wrapper">
												<div className="mini-bar" style={{ width: `${utilization}%` }} />
											</div>
											<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
												{utilization}%
											</span>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default Reports;
