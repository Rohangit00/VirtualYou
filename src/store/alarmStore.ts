import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmResponse, ALARM_XP } from '../utils/alarmTypes';

interface AlarmState {
    alarms: Alarm[];
    lastAlarmResponse: AlarmResponse | null;

    // Actions
    loadAlarms: () => Promise<void>;
    addAlarm: (time: string, days: number[], label: string) => Promise<void>;
    deleteAlarm: (id: string) => Promise<void>;
    toggleAlarm: (id: string) => Promise<void>;
    updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
    recordAlarmResponse: (alarmId: string, response: AlarmResponse['type'], responseTimeMs: number) => AlarmResponse;
    getNextAlarm: () => Alarm | null;
}

const ALARMS_STORAGE_KEY = 'virtualyou_alarms';

export const useAlarmStore = create<AlarmState>((set, get) => ({
    alarms: [],
    lastAlarmResponse: null,

    loadAlarms: async () => {
        try {
            const stored = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
            if (stored) {
                const alarms = JSON.parse(stored);
                set({ alarms });
            }
        } catch (error) {
            console.error('Failed to load alarms:', error);
        }
    },

    addAlarm: async (time: string, days: number[], label: string) => {
        const newAlarm: Alarm = {
            id: Date.now().toString(),
            time, // Format: "HH:MM"
            days, // 0 = Sunday, 1 = Monday, etc. Empty = one-time
            label,
            enabled: true,
            createdAt: new Date().toISOString(),
        };

        const alarms = [...get().alarms, newAlarm];
        set({ alarms });
        await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    },

    deleteAlarm: async (id: string) => {
        const alarms = get().alarms.filter(a => a.id !== id);
        set({ alarms });
        await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    },

    toggleAlarm: async (id: string) => {
        const alarms = get().alarms.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        );
        set({ alarms });
        await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    },

    updateAlarm: async (id: string, updates: Partial<Alarm>) => {
        const alarms = get().alarms.map(a =>
            a.id === id ? { ...a, ...updates } : a
        );
        set({ alarms });
        await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    },

    recordAlarmResponse: (alarmId: string, responseType: AlarmResponse['type'], responseTimeMs: number) => {
        let xpChange = 0;

        switch (responseType) {
            case 'dismissed_quick':
                xpChange = ALARM_XP.DISMISSED_QUICK;
                break;
            case 'dismissed_normal':
                xpChange = ALARM_XP.DISMISSED_NORMAL;
                break;
            case 'dismissed_late':
                xpChange = ALARM_XP.DISMISSED_LATE;
                break;
            case 'snoozed':
                xpChange = ALARM_XP.SNOOZED;
                break;
            case 'missed':
                xpChange = ALARM_XP.MISSED;
                break;
        }

        const response: AlarmResponse = {
            alarmId,
            type: responseType,
            responseTimeMs,
            xpChange,
            timestamp: new Date().toISOString(),
        };

        set({ lastAlarmResponse: response });
        return response;
    },

    getNextAlarm: () => {
        const { alarms } = get();
        const enabledAlarms = alarms.filter(a => a.enabled);

        if (enabledAlarms.length === 0) return null;

        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        let nextAlarm: Alarm | null = null;
        let minMinutesUntil = Infinity;

        for (const alarm of enabledAlarms) {
            const [hours, minutes] = alarm.time.split(':').map(Number);
            const alarmMinutes = hours * 60 + minutes;

            // Check if it's a repeating alarm or one-time
            const daysToCheck = alarm.days.length > 0 ? alarm.days : [currentDay];

            for (const day of daysToCheck) {
                let daysUntil = day - currentDay;
                if (daysUntil < 0 || (daysUntil === 0 && alarmMinutes <= currentTime)) {
                    daysUntil += 7;
                }

                const minutesUntil = daysUntil * 24 * 60 + (alarmMinutes - currentTime);

                if (minutesUntil < minMinutesUntil) {
                    minMinutesUntil = minutesUntil;
                    nextAlarm = alarm;
                }
            }
        }

        return nextAlarm;
    },
}));
