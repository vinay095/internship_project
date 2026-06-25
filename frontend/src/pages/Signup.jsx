import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LOCATIONS } from '../data/mock_data';
//import './Auth.css';

function Signup() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [location, setLocation] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { signup, ssoLogin } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}
		if (!location) {
			setError('Please select a location');
			return;
		}

		setLoading(true);
		try {
			await signup({ name, email, password, location });
			navigate('/dashboard');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSSO = async () => {
		setError('');
		setLoading(true);
		try {
			await ssoLogin();
			navigate('/dashboard');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
		<div className="auth-container">
			<div className="auth-header">
			<h1>MeetingRoom</h1>
			<p>Create your account</p>
			</div>

			<div className="auth-card">
			<form onSubmit={handleSubmit}>
				{error && <div className="form-error">{error}</div>}

				<div className="form-group">
				<input
					type="text"
					placeholder="Full Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				</div>

				<div className="form-group">
				<input
					type="email"
					placeholder="Email address"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				</div>

				<div className="form-group">
				<select
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					required
				>
					<option value="">Select Location</option>
					{LOCATIONS.map((loc) => (
					<option key={loc} value={loc}>{loc}</option>
					))}
				</select>
				</div>

				<div className="form-group">
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				</div>

				<div className="form-group">
				<input
					type="password"
					placeholder="Confirm Password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
				</div>

				<button
				type="submit"
				className="btn btn-primary btn-full"
				disabled={loading}
				>
				{loading ? 'Creating Account...' : 'Sign Up'}
				</button>
			</form>

			<div className="auth-divider">
				<span>or</span>
			</div>

			<button
				className="btn btn-sso btn-full"
				onClick={handleSSO}
				disabled={loading}
			>
				Sign in with Organization SSO
			</button>

			<div className="auth-footer">
				<p>
				Already have an account?{' '}
				<Link to="/login">Log In</Link>
				</p>
			</div>
			</div>
		</div>
		</div>
	);
}

export default Signup;
