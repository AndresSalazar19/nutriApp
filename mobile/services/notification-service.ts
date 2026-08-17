import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'health-reminders';

// Identificadores fijos: permiten programar de forma idempotente
// y cancelar solo estas notificaciones, no todas las de la app.
const HEALTH_REMINDERS = [
  { id: 'health-breakfast', hour: 7,  minute: 0, body: 'Registra tu peso y presión antes del desayuno' },
  { id: 'health-lunch',     hour: 12, minute: 0, body: 'Registra tu peso y presión antes del almuerzo' },
  { id: 'health-dinner',    hour: 18, minute: 0, body: 'Registra tu peso y presión antes de la cena' },
];

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Recordatorios de salud',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHealthReminders(): Promise<boolean> {
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  await ensureAndroidChannel();
  await cancelHealthReminders();

  for (const reminder of HEALTH_REMINDERS) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: 'Registro de salud',
        body: reminder.body,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
    });
  }

  return true;
}

export async function cancelHealthReminders() {
  await Promise.all(
    HEALTH_REMINDERS.map((r) =>
      Notifications.cancelScheduledNotificationAsync(r.id).catch(() => undefined),
    ),
  );
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Utilidad de prueba: evita esperar a las 07:00 para verificar que llegan
export async function scheduleTestNotification(seconds = 10) {
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Prueba NutrIA',
      body: 'Si ves esto, las notificaciones funcionan',
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}
