// Firebase configuration for push notifications
// Replace with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (only if config is available)
let firebaseApp = null;
let messaging = null;

if (firebaseConfig.apiKey) {
  try {
    // Import Firebase modules
    import { initializeApp } from 'firebase/app';
    import { getMessaging, getToken, onMessage } from 'firebase/messaging';

    firebaseApp = initializeApp(firebaseConfig);
    messaging = getMessaging(firebaseApp);

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return await getFCMToken();
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return await getFCMToken();
      }
    }

    throw new Error('Notification permission denied');
  } catch (error) {
    console.error('Notification permission request failed:', error);
    throw error;
  }
};

// Get FCM token
export const getFCMToken = async () => {
  if (!messaging) {
    throw new Error('Firebase messaging not initialized');
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log('FCM token obtained:', token);
      return token;
    } else {
      throw new Error('No FCM token available');
    }
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    throw error;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });

export { firebaseApp, messaging };