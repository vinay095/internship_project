

const BASE_URL = '/api';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
	get: async (endpoint) => { await delay(); return null; },
	post: async (endpoint, data) => { await delay(); return null; },
	put: async (endpoint, data) => { await delay(); return null; },
	delete: async (endpoint) => { await delay(); return null; }
}

export { BASE_URL };
export default api;