import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { login, ssoLogin } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			await login(email, password);
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
					<p>Book meeting rooms for your team</p>
				</div>

				<div className="auth-card">
					<form onSubmit={handleSubmit}>
						{error && <div className="form-error">{error}</div>}

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
							<input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<button
							type="submit"
							className="btn btn-primary btn-full"
							disabled={loading}
						>
							{loading ? 'Logging in...' : 'Log In'}
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
							Don't have an account?{' '}
							<Link to="/signup">Sign Up</Link>
						</p>
					</div>

					{/*<div className="demo-credentials">
				<p><strong>Demo Credentials:</strong></p>
				<p>HR: priya@company.com / password123</p>
				<p>Manager: rahul@company.com / password123</p>
				<p>Employee: amit@company.com / password123</p>
			</div>*/}
				</div>
			</div>
		</div>
	);
}

export default Login;
