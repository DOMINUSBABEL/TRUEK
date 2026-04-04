import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db } from './firebase';

export const requestNotificationPermission = async (userId: string) => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this browser/environment.');
      return;
    }

    if (typeof Notification === 'undefined') {
      console.log('Notification API not available.');
      return;
    }

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Note: In a real app, you need to pass your VAPID key here
      const token = await getToken(messaging);
      
      if (token) {
        // Save token to user profile
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token
        });
        console.log('FCM Token saved');
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const setupMessageListener = async () => {
  try {
    const supported = await isSupported();
    if (!supported) return;

    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
  }
};
