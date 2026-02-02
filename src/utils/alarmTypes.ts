// Alarm types and XP constants

export interface Alarm {
    id: string;
    time: string; // Format: "HH:MM" (24-hour)
    days: number[]; // 0 = Sunday, 1 = Monday, etc. Empty array = one-time
    label: string;
    enabled: boolean;
    createdAt: string;
}

export interface AlarmResponse {
    alarmId: string;
    type: 'dismissed_quick' | 'dismissed_normal' | 'dismissed_late' | 'snoozed' | 'missed';
    responseTimeMs: number;
    xpChange: number;
    timestamp: string;
}

// XP rewards/penalties
export const ALARM_XP = {
    DISMISSED_QUICK: 25,   // Within 30 seconds
    DISMISSED_NORMAL: 15,  // Within 2 minutes
    DISMISSED_LATE: 5,     // Any time
    SNOOZED: -10,          // Per snooze tap
    MISSED: -20,           // Didn't respond
} as const;

// Timing thresholds in milliseconds
export const ALARM_TIMING = {
    QUICK_DISMISS_MS: 30 * 1000,    // 30 seconds
    NORMAL_DISMISS_MS: 2 * 60 * 1000, // 2 minutes
    SNOOZE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
    MISSED_TIMEOUT_MS: 5 * 60 * 1000, // Consider missed after 5 min
} as const;

// Day names for UI
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to format alarm time for display
export function formatAlarmTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Helper to get repeat label
export function getRepeatLabel(days: number[]): string {
    if (days.length === 0) return 'Once';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => DAY_NAMES[d]).join(', ');
}

// Calculate XP based on response time
export function calculateAlarmXP(responseTimeMs: number, wasSnoozed: boolean): {
    type: AlarmResponse['type'];
    xp: number;
} {
    if (wasSnoozed) {
        return { type: 'snoozed', xp: ALARM_XP.SNOOZED };
    }

    if (responseTimeMs <= ALARM_TIMING.QUICK_DISMISS_MS) {
        return { type: 'dismissed_quick', xp: ALARM_XP.DISMISSED_QUICK };
    }

    if (responseTimeMs <= ALARM_TIMING.NORMAL_DISMISS_MS) {
        return { type: 'dismissed_normal', xp: ALARM_XP.DISMISSED_NORMAL };
    }

    return { type: 'dismissed_late', xp: ALARM_XP.DISMISSED_LATE };
}
