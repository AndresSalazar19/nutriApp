import * as Notifications from "expo-notifications";

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();

  return status === "granted";
}

export async function scheduleNotification(
  title: string,
  body: string,
  hour: number,
  minute: number
) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleHealthReminders() {
  await scheduleNotification(
    "Registro de salud",
    "Registra tu peso y presión arterial antes del desayuno",
    7,
    0
  );

  await scheduleNotification(
    "Registro de salud",
    "Registra tu peso y presión arterial antes del almuerzo",
    12,
    0
  );

  await scheduleNotification(
    "Registro de salud",
    "Registra tu peso y presión arterial antes de la cena",
    18,
    0
  );
}

export async function cancelHealthReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}