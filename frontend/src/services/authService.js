import { users, generateId } from '../data/mock_data';

// simulate auth; replace later

export const authService = {
	login: async (email, password) => {
		const user = users.find(
			(u) => u.email === email && u.password === password
		);
		if (!user) {
			throw new Error('Invalid email or password');
		}
		const { password: _, ...userWithoutPassword } = user;
		// extract password and store it in `_` and rest of values in `userWithoutPassword`
		return {
			user: userWithoutPassword,
			token: 'mock-jwt-token-' + user.id,
		};
	},

	signup: async ({ name, email, password, location }) => {
		const exists = users.find((u) => u.email === email);
		if (exists) {
			throw new Error('Email already registered');
		}

		// find managers in the same location for assigning reporting manager to this new signup
		const locationManagers = users.filter(
			(u) => u.role === 'manager' && u.location === location
		);

		const newUser = {
			id: generateId('u'), name, email, password, role: 'employee', location, reportingManagerId: locationManagers.length > 0 ? locationManagers[0].id : null,
		};

		users.push(newUser);	// add new user to user array

		const { password: _, ...userWithoutPassword } = newUser;
		return {
			user: userWithoutPassword,
			token: 'mock-jwt-token-' + newUser.id,
		};
	},

	ssoLogin: async () => {
		// simulate SSO;
		const user = users.find((u) => u.role === 'employee');
		const { password: _, ...userWithoutPassword } = user;
		return {
			user: userWithoutPassword,
			token: 'mock-sso-token-' + user.id
		};
	},

	getManagers: () => {
		return users.filter((u) => u.role === 'manager' || u.role === 'hr').map(({ password: _, ...u }) => u);
	},

	getUserById: (id) => {
		const user = users.find((u) => u.id === id);
		if (!user) return null;
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	},

	getAllUsers: () => {
		return users.map(({ password: _, ...u }) => u);
	},
};

export default authService;
