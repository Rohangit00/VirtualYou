// Avatar state based on daily activity
export type AvatarState = 'thriving' | 'healthy' | 'tired' | 'drained';

export interface AvatarStateConfig {
    state: AvatarState;
    label: string;
    description: string;
    color: string;
    emoji: string;
}

export const AVATAR_STATES: Record<AvatarState, AvatarStateConfig> = {
    thriving: {
        state: 'thriving',
        label: 'Thriving',
        description: 'Your avatar is radiating energy!',
        color: '#FFD700', // Gold
        emoji: '🔥',
    },
    healthy: {
        state: 'healthy',
        label: 'Healthy',
        description: 'Your avatar is feeling good.',
        color: '#4CAF50', // Green
        emoji: '😊',
    },
    tired: {
        state: 'tired',
        label: 'Tired',
        description: 'Your avatar needs some rest.',
        color: '#2196F3', // Blue
        emoji: '😴',
    },
    drained: {
        state: 'drained',
        label: 'Drained',
        description: 'Your avatar is running low on energy.',
        color: '#9E9E9E', // Gray
        emoji: '💀',
    },
};

// Determine avatar state based on daily XP
export function getAvatarState(dailyXP: number): AvatarState {
    if (dailyXP >= 50) return 'thriving';
    if (dailyXP >= 20) return 'healthy';
    if (dailyXP >= 0) return 'tired';
    return 'drained';
}

// Thresholds for state transitions
export const STATE_THRESHOLDS = {
    THRIVING: 50, // Net +50 XP today
    HEALTHY: 20,  // Net +20 XP today
    TIRED: 0,     // Net 0 XP today
    DRAINED: -1,  // Negative XP today
} as const;
