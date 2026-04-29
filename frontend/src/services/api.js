import axios from 'axios';

// ✅ FORCE correct backend URL in production with fallback
const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

console.log('API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Token helper
const getToken = () => localStorage.getItem('token');

// Error handler
const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

// Response unwrap
const unwrap = (response) => {
  if (response?.data?.success === false) {
    throw new Error(response.data.message || 'Request failed');
  }
  return response?.data?.data;
};

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Standardized error response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = getErrorMessage(error);

    console.error('API Error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method
    });

    // Handle 401 Unauthorized - clear auth and redirect
    if (status === 401) {
      console.warn('401 Unauthorized - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

// ===================== AUTH =====================
export const authAPI = {
  register: async (data) =>
    unwrap(
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      })
    ),
  login: async (data) => unwrap(await api.post('/auth/login', data)),
  getMe: async () => unwrap(await api.get('/auth/me')),
  refresh: async (data) => unwrap(await api.post('/auth/refresh', data)),
  logout: async (data) => unwrap(await api.post('/auth/logout', data)),
};

// ===================== USERS =====================
export const userAPI = {
  getAllUsers: async () => unwrap(await api.get('/users')),
  getUserProfile: async (id) => unwrap(await api.get(`/users/${id}`)),
  updateProfile: async (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const endpoint = data instanceof FormData ? '/users/update-profile' : `/users/${id}`;
    return unwrap(await api.put(endpoint, data, config));
  },
  uploadProfilePic: async (formData) => unwrap(await api.post('/users/upload-profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })),
  enhanceBio: async (data) => unwrap(await api.post('/users/enhance-bio', data)),
  generateBio: async (data) => unwrap(await api.post('/ai/generate-bio', data)),
};

// ===================== MATCH =====================
export const matchAPI = {
  getMatches: async () => unwrap(await api.get('/match')),
};

// ===================== REQUEST =====================
export const requestAPI = {
  sendRequest: async (data) => unwrap(await api.post('/requests', data)),
  getIncomingRequests: async () => unwrap(await api.get('/requests/incoming')),
  getSentRequests: async () => unwrap(await api.get('/requests/sent')),
  acceptRequest: async (id) => unwrap(await api.put(`/requests/${id}/accept`)),
  rejectRequest: async (id) => unwrap(await api.put(`/requests/${id}/reject`)),
};

// ===================== NOTIFICATION =====================
export const chatAPI = {
  getMessages: async (userId) =>
    unwrap(await api.get(`/chat/${userId}`)),
  sendMessage: async (data) =>
    unwrap(await api.post('/chat', data)),
  getConversations: async () =>
    unwrap(await api.get('/chat/conversations')),
};

// ===================== NOTIFICATION =====================
export const notificationAPI = {
  getNotifications: async () => unwrap(await api.get('/notifications')),
  getUnreadCount: async () => unwrap(await api.get('/notifications/unread-count')),
  markAsRead: async (id) => unwrap(await api.put(`/notifications/${id}/read`)),
  markAllAsRead: async () => unwrap(await api.put('/notifications/mark-all-read')),
};