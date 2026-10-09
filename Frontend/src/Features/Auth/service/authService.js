/**
 * Authentication Service
 * ======================
 * Manages HTTP requests to the backend /api/auth endpoints,
 * token persistence in localStorage, and user session storage.
 */

const API_BASE = 'http://localhost:5000/api/auth';
const TOKEN_KEY = 'florascan_auth_token';
const USER_KEY = 'florascan_user_data';

export const authService = {
  // Token & Storage utilities
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setStoredUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // API Calls
  async register({ name, email, password, role = 'operator' }) {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    if (data.token) {
      this.setToken(data.token);
      this.setStoredUser(data.user);
    }

    return data;
  },

  async login({ email, password }) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    if (data.token) {
      this.setToken(data.token);
      this.setStoredUser(data.user);
    }

    return data;
  },

  async getMe() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available.');
    }

    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      this.clearSession();
      throw new Error(data.message || 'Session expired.');
    }

    if (data.user) {
      this.setStoredUser(data.user);
    }

    return data.user;
  },

  logout() {
    this.clearSession();
  },
};

export default authService;
