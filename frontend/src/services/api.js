import axios from 'axios';

// ===================== BASE CONFIG =====================
const normalizeUrl = (url) => url?.replace(/\/+$/, "");

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

export const API_URL = normalizeUrl(rawApiUrl);
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

console.log("API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// ===================== HELPERS =====================
const getToken = () => localStorage.getItem("token");

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

const unwrap = (response) => {
  if (!response?.data) throw new Error("Invalid response");

  if (response.data.success === false) {
    throw new Error(response.data.message || "Request failed");
  }

  return response.data.data ?? response.data;
};

// ===================== INTERCEPTORS =====================
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message = getErrorMessage(error);

    console.error("API Error:", {
      status,
      message,
      url: error.config?.url,
    });

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

// ===================== AUTH =====================
export const authAPI = {
  register: async (data) =>
    unwrap(
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      })
    ),

  login: async (data) => unwrap(await api.post("/auth/login", data)),

  getMe: async () => unwrap(await api.get("/auth/me")),

  logout: async () => unwrap(await api.post("/auth/logout")),
};

// ===================== USERS =====================
export const userAPI = {
  getAllUsers: async () => unwrap(await api.get("/users")),

  getUserProfile: async (id) => {
    if (!id) throw new Error("User ID is required");
    return unwrap(await api.get(`/users/${id}`));
  },

  updateProfile: async (id, data) => {
    if (!data) throw new Error("Update data required");

    const isForm = data instanceof FormData;

    return unwrap(
      await api.put(
        isForm ? "/users/update-profile" : `/users/${id}`,
        data,
        isForm ? { headers: { "Content-Type": "multipart/form-data" } } : {}
      )
    );
  },

  uploadProfilePic: async (formData) =>
    unwrap(
      await api.post("/users/upload-profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  generateBio: async (data) => unwrap(await api.post("/users/generate-bio", data)),
};

// ===================== MATCH =====================
export const matchAPI = {
  getMatches: async () => unwrap(await api.get("/match")),
};

// ===================== REQUEST =====================
export const requestAPI = {
  sendRequest: async (data) => {
    const receiverId = typeof data === "string" ? data : data?.receiverId;

    if (!receiverId) {
      throw new Error("Receiver ID is required");
    }

    return unwrap(
      await api.post("/requests", {
        receiverId,
      })
    );
  },

  getIncomingRequests: async () =>
    unwrap(await api.get("/requests/incoming")),

  getSentRequests: async () =>
    unwrap(await api.get("/requests/sent")),

  acceptRequest: async (id) => {
    if (!id) throw new Error("Request ID required");
    return unwrap(await api.put(`/requests/${id}/accept`));
  },

  rejectRequest: async (id) => {
    if (!id) throw new Error("Request ID required");
    return unwrap(await api.put(`/requests/${id}/reject`));
  },
};

// ===================== CHAT =====================
export const chatAPI = {
  getMessages: async (userId) => {
    if (!userId) throw new Error("User ID required");
    return unwrap(await api.get(`/chat/${userId}`));
  },

  sendMessage: async (data) => {
    if (!data?.receiverId || !data?.message) {
      throw new Error("ReceiverId and message required");
    }
    return unwrap(await api.post("/chat", data));
  },

  getConversations: async () =>
    unwrap(await api.get("/chat/conversations")),
};

// ===================== NOTIFICATION =====================
export const notificationAPI = {
  getNotifications: async () =>
    unwrap(await api.get("/notifications")),

  getUnreadCount: async () =>
    unwrap(await api.get("/notifications/unread-count")),

  markAsRead: async (id) => {
    if (!id) throw new Error("Notification ID required");
    return unwrap(await api.put(`/notifications/${id}/read`));
  },

  markAllAsRead: async () =>
    unwrap(await api.put("/notifications/mark-all-read")),
};
