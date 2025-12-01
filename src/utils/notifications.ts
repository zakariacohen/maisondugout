import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  static async initialize() {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Not running on native platform, notifications disabled');
      return;
    }

    try {
      // Request permissions
      const permissionResult = await LocalNotifications.requestPermissions();
      
      if (permissionResult.display === 'granted') {
        console.log('Local notification permissions granted');
      }

      // Register for push notifications
      await PushNotifications.requestPermissions();
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
      });

      // Listen for notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification);
      });

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  static async scheduleUrgentOrderNotification(orderId: string, customerName: string, deliveryDate: Date) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Skipping notification - not on native platform');
      return;
    }

    try {
      const notifications: ScheduleOptions = {
        notifications: [
          {
            title: '⚠️ Commande Urgente',
            body: `La commande de ${customerName} doit être livrée aujourd'hui !`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 1000) }, // immediate
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              orderId: orderId,
              type: 'urgent_order'
            }
          }
        ]
      };

      await LocalNotifications.schedule(notifications);
      console.log('Urgent order notification scheduled');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async notifyUrgentOrders(urgentOrders: any[]) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Skipping notifications - not on native platform');
      return;
    }

    if (urgentOrders.length === 0) return;

    try {
      const notifications: ScheduleOptions = {
        notifications: urgentOrders.map((order, index) => ({
          title: '⚠️ Commandes Urgentes',
          body: `${urgentOrders.length} commande(s) à livrer aujourd'hui, dont ${order.customerName}`,
          id: Math.floor(Math.random() * 100000) + index,
          schedule: { at: new Date(Date.now() + (index * 2000)) },
          sound: 'beep.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            orderId: order.id,
            type: 'urgent_orders'
          }
        }))
      };

      await LocalNotifications.schedule(notifications);
      console.log(`${urgentOrders.length} urgent notifications scheduled`);
    } catch (error) {
      console.error('Error notifying urgent orders:', error);
    }
  }

  static async playSound() {
    // Play a simple beep sound for web version
    if (!Capacitor.isNativePlatform()) {
      const audio = new Audio('data:audio/wav;base64,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');
      audio.play().catch(e => console.log('Could not play sound:', e));
    }
  }
}
