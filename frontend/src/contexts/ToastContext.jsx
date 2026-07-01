import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);
	const [confirm, setConfirm] = useState(null); // { message, onConfirm, onCancel }
	const resolveRef = useRef(null);

	const showToast = useCallback((message, type = 'info') => {
		const id = ++toastId;
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 3500);
	}, []);

	const dismissToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	// Returns a Promise: true if confirmed, false if cancelled
	const showConfirm = useCallback((message) => {
		return new Promise((resolve) => {
			resolveRef.current = resolve;
			setConfirm({ message });
		});
	}, []);

	const handleConfirmOk = () => {
		setConfirm(null);
		resolveRef.current?.(true);
	};

	const handleConfirmCancel = () => {
		setConfirm(null);
		resolveRef.current?.(false);
	};

	return (
		<ToastContext.Provider value={{ showToast, showConfirm, dismissToast }}>
			{children}

			{/* Toast stack — bottom right */}
			<div className="toast-stack" aria-live="polite">
				{toasts.map((t) => (
					<div key={t.id} className={`toast-item toast-${t.type}`}>
						<span className="toast-icon">
							{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
						</span>
						<span className="toast-message">{t.message}</span>
						<button className="toast-close" onClick={() => dismissToast(t.id)}>✕</button>
					</div>
				))}
			</div>

			{/* Confirm dialog overlay */}
			{confirm && (
				<div className="confirm-overlay" onClick={handleConfirmCancel}>
					<div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
						<p className="confirm-message">{confirm.message}</p>
						<div className="confirm-actions">
							<button className="btn btn-secondary" onClick={handleConfirmCancel}>
								Cancel
							</button>
							<button className="btn btn-danger" onClick={handleConfirmOk}>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
	return ctx;
}
