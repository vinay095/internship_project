//import './App.css'

//function App() {

//}

//export default App;


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Booking';
import MyRequests from './pages/MyRequests';
import ManageRequests from './pages/ManageRequests';
import ManageRooms from './pages/ManageRooms';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					{/* Public Routes */}
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />

					{/* Protected Routes */}
					<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
						<Route index element={<Navigate to="/dashboard" replace />} />
						<Route path="dashboard" element={<Dashboard />} />
						<Route path="rooms" element={<Rooms />} />
						<Route path="bookings" element={<Bookings />} />

						{/* Employee only */}
						<Route
							path="my-requests"
							element={
								<ProtectedRoute allowedRoles={['employee']}>
									<MyRequests />
								</ProtectedRoute>
							}
						/>

						{/* Manager and admin */}
						<Route
							path="manage-requests"
							element={
								<ProtectedRoute allowedRoles={['manager']}>
									<ManageRequests />
								</ProtectedRoute>
							}
						/>

						{/* admin only */}
						<Route
							path="manage-rooms"
							element={
								<ProtectedRoute allowedRoles={['admin']}>
									<ManageRooms />
								</ProtectedRoute>
							}
						/>

						{/* Manager and admin */}
						<Route
							path="reports"
							element={
								<ProtectedRoute allowedRoles={['manager']}>
									<Reports />
								</ProtectedRoute>
							}
						/>
					</Route>

					{/* Catch-all — show animated 404 page */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
