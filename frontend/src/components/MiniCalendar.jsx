import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { bookingService } from '../services/bookingService';
import 'react-day-picker/style.css';
import './MiniCalendar.css';

/**
 * MiniCalendar — a themed date-picker popover rendered via a React Portal.
 * The calendar is mounted directly on document.body so it is never clipped
 * by any parent's overflow, z-index, or transform context.
 *
 * Props:
 *   value    — selected date as "YYYY-MM-DD" string (or '')
 *   onChange — called with "YYYY-MM-DD" string whenever user picks a date
 *   minDate  — earliest selectable date as "YYYY-MM-DD" string (optional)
 */
function MiniCalendar({ value, onChange, minDate }) {
	const [open, setOpen] = useState(false);
	const [popoverStyle, setPopoverStyle] = useState({});
	const triggerRef = useRef(null);

	// Convert YYYY-MM-DD string → JS Date (local, not UTC)
	const strToDate = (str) => {
		if (!str) return undefined;
		const [y, m, d] = str.split('-').map(Number);
		return new Date(y, m - 1, d);
	};

	// Convert JS Date → YYYY-MM-DD string
	const dateToStr = (date) => {
		if (!date) return '';
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	};

	const selected = strToDate(value);
	const disabledBefore = minDate ? strToDate(minDate) : undefined;

	// Calculate popover position relative to viewport, decide open up/down
	const calculatePosition = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const POPOVER_HEIGHT = 320; // approximate calendar height
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUpward = spaceBelow < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT;

		if (openUpward) {
			setPopoverStyle({
				position: 'fixed',
				left: rect.left,
				bottom: window.innerHeight - rect.top + 6,
				top: 'auto',
				width: 'auto',
				zIndex: 99999,
			});
		} else {
			setPopoverStyle({
				position: 'fixed',
				left: rect.left,
				top: rect.bottom + 6,
				width: 'auto',
				zIndex: 99999,
			});
		}
	}, []);

	const handleOpen = () => {
		calculatePosition();
		setOpen((v) => !v);
	};

	const handleSelect = (date) => {
		if (date) {
			onChange(dateToStr(date));
			setOpen(false);
		}
	};

	// Close when clicking outside
	useEffect(() => {
		const handler = (e) => {
			// close if click is not on the trigger or the popover
			if (
				triggerRef.current &&
				!triggerRef.current.contains(e.target) &&
				!e.target.closest('.mc-popover-portal')
			) {
				setOpen(false);
			}
		};
		if (open) {
			document.addEventListener('mousedown', handler);
			// Recalculate position on scroll/resize
			window.addEventListener('scroll', calculatePosition, true);
			window.addEventListener('resize', calculatePosition);
		}
		return () => {
			document.removeEventListener('mousedown', handler);
			window.removeEventListener('scroll', calculatePosition, true);
			window.removeEventListener('resize', calculatePosition);
		};
	}, [open, calculatePosition]);

	const displayText = value
		? bookingService.formatDateToDisplay(value)
		: 'Select date';

	return (
		<div className="mc-wrapper">
			<button
				type="button"
				ref={triggerRef}
				className={`mc-trigger ${open ? 'mc-trigger-open' : ''} ${!value ? 'mc-trigger-placeholder' : ''}`}
				onClick={handleOpen}
			>
			<span>{displayText}</span>
				<span className="mc-trigger-chevron">{open ? '▲' : '▼'}</span>
			</button>

			{open && createPortal(
				<div className="mc-popover mc-popover-portal" style={popoverStyle}>
					<DayPicker
						mode="single"
						selected={selected}
						onSelect={handleSelect}
						disabled={disabledBefore ? { before: disabledBefore } : undefined}
						showOutsideDays
					/>
				</div>,
				document.body
			)}
		</div>
	);
}

export default MiniCalendar;
