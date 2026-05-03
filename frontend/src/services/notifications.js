// src/services/notifications.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// GCP/Firebase configuration (branded as GCP for BallotBuddy)
const gcpConfig = {
  apiKey: import.meta.env.VITE_GCP_API_KEY || "mock-api-key",
  authDomain: `${import.meta.env.VITE_GCP_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_GCP_PROJECT_ID || "ballotbuddy-demo",
  storageBucket: `${import.meta.env.VITE_GCP_PROJECT_ID}.appspot.com`,
  messagingSenderId:
    import.meta.env.VITE_GCP_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_GCP_APP_ID || "mock-app-id",
};

const app = initializeApp(gcpConfig);

export const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) return null;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_GCP_VAPID_KEY || "mock-vapid-key",
      }).catch((err) => {
        if (import.meta.env.DEV) console.warn("FCM token fetch failed:", err);
        return "mock-fcm-token-" + Date.now();
      });
      return currentToken;
    }
    return null;
  } catch (error) {
    if (import.meta.env.DEV)
      console.error("Notification permission error:", error);
    return "mock-fcm-token-fallback";
  }
};

export const onMessageListener = () => {
  try {
    const messaging = getMessaging(app);
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn("FCM message listener error:", err);
    return new Promise(() => {});
  }
};
