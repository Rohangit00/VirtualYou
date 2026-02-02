// XP configuration values
export const XP_VALUES = {
    // Positive XP gains
    STEPS_PER_XP: 100, // 100 steps = 1 XP
    FOCUS_XP_PER_30MIN: 10, // 30 min focus = 10 XP
    GYM_XP_PER_SESSION: 25, // 1 gym session = 25 XP
    GOOD_SLEEP_XP: 15, // 7-8 hours sleep bonus

    // Negative XP
    SCREEN_TIME_XP_PER_HOUR: -5, // -5 XP per hour over threshold
    SCREEN_TIME_FREE_HOURS: 3, // First 3 hours are free (non-productive)

    // Streak bonuses
    STREAK_MULTIPLIER: 0.1, // 10% bonus per day of streak (max 50%)
    MAX_STREAK_BONUS: 0.5,
} as const;

// Activity types
export type ActivityType = 'steps' | 'focus' | 'gym' | 'sleep' | 'screenTime';

export interface ActivityEntry {
    id: string;
    type: ActivityType;
    value: number; // steps count, minutes, sessions, hours
    xpGained: number;
    timestamp: number;
    date: string; // YYYY-MM-DD format
}

// Calculate XP for different activity types
export function calculateXP(type: ActivityType, value: number): number {
    switch (type) {
        case 'steps':
            return Math.floor(value / XP_VALUES.STEPS_PER_XP);
        case 'focus':
            return Math.floor((value / 30) * XP_VALUES.FOCUS_XP_PER_30MIN);
        case 'gym':
            return value * XP_VALUES.GYM_XP_PER_SESSION;
        case 'sleep':
            // Bonus XP only for good sleep (7-8 hours)
            return value >= 7 && value <= 8 ? XP_VALUES.GOOD_SLEEP_XP : 0;
        case 'screenTime':
            // Only count hours over the free threshold
            const excessHours = Math.max(0, value - XP_VALUES.SCREEN_TIME_FREE_HOURS);
            return Math.floor(excessHours * XP_VALUES.SCREEN_TIME_XP_PER_HOUR);
        default:
            return 0;
    }
}

// Apply streak multiplier to positive XP
export function applyStreakBonus(xp: number, streakDays: number): number {
    if (xp <= 0 || streakDays <= 0) return xp;

    const bonusMultiplier = Math.min(
        streakDays * XP_VALUES.STREAK_MULTIPLIER,
        XP_VALUES.MAX_STREAK_BONUS
    );

    return Math.floor(xp * (1 + bonusMultiplier));
}
