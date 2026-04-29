import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const LOCAL_BACKEND_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const DEFAULT_API_BASE_URL = `http://${LOCAL_BACKEND_HOST}:5000/api`;
const expoConfig = Constants.expoConfig || Constants.manifest;
const API_BASE_URL = expoConfig?.extra?.apiBaseUrl || DEFAULT_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredAuthToken = async () => AsyncStorage.getItem('authToken');
const getStoredRefreshToken = async () => AsyncStorage.getItem('refreshToken');
const getStoredUserId = async () => AsyncStorage.getItem('userId');

const parseApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  const target = error.response?.data;
  if (target?.message) {
    return target.message;
  }

  if (Array.isArray(target?.error)) {
    return target.error.map((item) => item.message || item).join(', ');
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected API error occurred';
};

const saveAuthData = async (responseData, preserveUser = true) => {
  const tokens = responseData?.tokens || responseData?.data?.tokens || responseData;
  const user = responseData?.user || responseData?.data?.user;

  if (tokens?.accessToken) {
    await AsyncStorage.setItem('authToken', tokens.accessToken);
  }
  if (tokens?.refreshToken) {
    await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
  }
  if (preserveUser && user?._id) {
    await AsyncStorage.setItem('userId', user._id);
  }
};

const normalizeSkillInput = (skill) => {
  if (typeof skill === 'string') {
    return { skill, level: 'beginner' };
  }

  return {
    skill: skill?.skill || skill?.name || '',
    level: skill?.level || 'beginner',
  };
};

const getResponseData = (response) => {
  const payload = response?.data;
  if (!payload) {
    throw new Error('No response data available');
  }
  if (payload.success === false) {
    throw new Error(payload.message || 'API request failed');
  }
  return payload.data;
};

api.interceptors.request.use(
  async (config) => {
    const token = await getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = await getStoredRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken });
          const refreshedData = getResponseData(refreshResponse);
          await saveAuthData(refreshedData, false);
          originalRequest.headers.Authorization = `Bearer ${refreshedData.tokens.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userId']);
          return Promise.reject(new Error(parseApiError(refreshError)));
        }
      }
    }

    return Promise.reject(new Error(parseApiError(error)));
  }
);

export const signUp = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    const data = getResponseData(response);
    await saveAuthData(data);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const data = getResponseData(response);
    await saveAuthData(data);
    return data;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const logout = async () => {
  try {
    const refreshToken = await getStoredRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.warn('Logout API error:', parseApiError(error));
  } finally {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userId']);
  }
};

export const updateProfile = async (profileData) => {
  try {
    const userId = await getStoredUserId();
    const response = await api.put(`/users/${userId}`, profileData);
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const getProfile = async () => {
  try {
    const userId = await getStoredUserId();
    const response = await api.get(`/users/${userId}`);
    return getResponseData(response).user;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const getMatchedUsers = async () => {
  try {
    const response = await api.get('/match');
    return getResponseData(response).matches || [];
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const sendSwapRequest = async (targetUserId, offeredSkill, requestedSkill) => {
  try {
    const response = await api.post('/swap', {
      responderId: targetUserId,
      requesterSkill: normalizeSkillInput(offeredSkill),
      responderSkill: normalizeSkillInput(requestedSkill),
      message: `Offering: ${offeredSkill}; Requesting: ${requestedSkill}`,
    });
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const getSwapRequests = async () => {
  try {
    const response = await api.get('/swap');
    return getResponseData(response).requests || [];
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const acceptSwapRequest = async (requestId) => {
  try {
    const response = await api.put(`/swap/${requestId}`, { status: 'accepted' });
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const rejectSwapRequest = async (requestId) => {
  try {
    const response = await api.put(`/swap/${requestId}`, { status: 'rejected' });
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const getChat = async (userId) => {
  try {
    const response = await api.get(`/chat/${userId}`);
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const sendMessage = async (userId, message) => {
  try {
    const response = await api.post('/chat', { recipientId: userId, content: message });
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const rateUser = async (targetUserId, rating, review) => {
  try {
    const response = await api.post('/review', { revieweeId: targetUserId, rating, feedback: review });
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export const getUserRating = async (userId) => {
  try {
    const response = await api.get(`/review/${userId}`);
    return getResponseData(response);
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

export default api;
