import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { app, db } from './firebase';
import toast from 'react-hot-toast';

export const requestNotificationPermission = async (userId: string) => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Note: In a real app, you need to pass your VAPID key here
      // const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      const token = await getToken(messaging);
      
      if (token) {
        // Save token to user profile
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token
        });
      }
    }
  } catch (error) {
    toast.error('Error al solicitar permiso de notificaciones');
  }
};

export const setupMessageListener = () => {
  try {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      // Here you could use toast to show the notification if the app is in foreground
      // toast(payload.notification?.title || 'Nueva notificación');
    });
  } catch (error) {
    toast.error('Error al configurar notificaciones');
  }
};
