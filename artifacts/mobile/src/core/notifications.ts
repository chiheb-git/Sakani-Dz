import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  const enabled = await requestNotificationPermissions();
  if (!enabled) return null;

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data ?? null;
}

export async function scheduleVendorSubscriptionReminder(expiresAt?: string | Date | null): Promise<void> {
  if (!expiresAt) return;

  const expiresDate = new Date(expiresAt);
  const reminderTime = new Date(expiresDate.getTime() - 1000 * 60 * 60 * 24 * 7);

  if (Number.isNaN(reminderTime.getTime()) || reminderTime <= new Date()) return;

  if (Platform.OS === 'web') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rappel Sakani Dz',
      body: 'Votre abonnement vendeur arrive à expiration. Pensez à le renouveler pour garder l’accès à votre espace.',
    },
    trigger: reminderTime as any,
  });
}
