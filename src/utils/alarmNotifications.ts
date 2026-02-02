import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm, ALARM_TIMING } from './alarmTypes';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
    }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.warn('Notifications only work on physical devices');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
    }

    // Android specific: Create notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarms', {
            name: 'Alarms',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 250, 500, 250, 500],
            sound: 'default',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true, // Bypass Do Not Disturb
        });
    }

    return true;
}

// Schedule an alarm notification
export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
    try {
        // Cancel any existing notification for this alarm
        await cancelAlarmNotification(alarm.id);

        const [hours, minutes] = alarm.time.split(':').map(Number);

        // For one-time alarms or repeating alarms
        if (alarm.days.length === 0) {
            // One-time alarm - schedule for next occurrence of this time
            const now = new Date();
            const alarmDate = new Date();
            alarmDate.setHours(hours, minutes, 0, 0);

            // If time has passed today, schedule for tomorrow
            if (alarmDate <= now) {
                alarmDate.setDate(alarmDate.getDate() + 1);
            }

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⚔️ WAKE UP, WARRIOR!',
                    body: alarm.label || 'Time to rise and claim your XP!',
                    data: { alarmId: alarm.id, type: 'alarm' },
                    sound: true,
                    priority: 'max',
                    categoryIdentifier: 'alarm',
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: alarmDate,
                },
                identifier: alarm.id,
            });

            return notificationId;
        } else {
            // Repeating alarm - schedule for each day
            // Note: We schedule multiple notifications, one for each day
            const notificationIds: string[] = [];

            for (const day of alarm.days) {
                const weekday = day === 0 ? 1 : day + 1; // Expo uses 1-7 (Sunday=1)

                const notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: '⚔️ WAKE UP, WARRIOR!',
                        body: alarm.label || 'Time to rise and claim your XP!',
                        data: { alarmId: alarm.id, type: 'alarm', dayOfWeek: day },
                        sound: true,
                        priority: 'max',
                        categoryIdentifier: 'alarm',
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                        weekday,
                        hour: hours,
                        minute: minutes,
                    },
                    identifier: `${alarm.id}_${day}`,
                });

                notificationIds.push(notificationId);
            }

            return notificationIds[0]; // Return first ID
        }
    } catch (error) {
        console.error('Failed to schedule alarm notification:', error);
        return null;
    }
}

// Cancel an alarm notification
export async function cancelAlarmNotification(alarmId: string): Promise<void> {
    try {
        // Cancel the main notification
        await Notifications.cancelScheduledNotificationAsync(alarmId);

        // Cancel any day-specific notifications
        for (let day = 0; day < 7; day++) {
            await Notifications.cancelScheduledNotificationAsync(`${alarmId}_${day}`);
        }
    } catch (error) {
        console.error('Failed to cancel notification:', error);
    }
}

// Cancel all alarm notifications
export async function cancelAllAlarmNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}

// Schedule snooze notification
export async function scheduleSnoozeNotification(alarm: Alarm): Promise<string | null> {
    try {
        const snoozeTime = new Date(Date.now() + ALARM_TIMING.SNOOZE_DURATION_MS);

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '😴 SNOOZE OVER!',
                body: 'You lost XP for snoozing. Redeem yourself now!',
                data: { alarmId: alarm.id, type: 'snooze' },
                sound: true,
                priority: 'max',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: snoozeTime,
            },
            identifier: `${alarm.id}_snooze`,
        });

        return notificationId;
    } catch (error) {
        console.error('Failed to schedule snooze notification:', error);
        return null;
    }
}

// Setup notification response listener
export function setupNotificationResponseListener(
    onAlarmTriggered: (alarmId: string) => void
): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        if (data?.type === 'alarm' || data?.type === 'snooze') {
            onAlarmTriggered(data.alarmId as string);
        }
    });

    return () => subscription.remove();
}

// Setup notification received listener (when app is in foreground)
export function setupNotificationReceivedListener(
    onAlarmReceived: (alarmId: string) => void
): () => void {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
        const data = notification.request.content.data;
        if (data?.type === 'alarm' || data?.type === 'snooze') {
            onAlarmReceived(data.alarmId as string);
        }
    });

    return () => subscription.remove();
}
