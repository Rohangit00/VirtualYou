import { create } from 'zustand';
import { ActivityEntry, ActivityType, calculateXP } from '../utils/xpCalculator';
import { getLevelForXP, getProgressToNextLevel, Level } from '../utils/levelSystem';
import { getAvatarState, AvatarState } from '../utils/avatarStates';
import { getTodayDateString, isConsecutiveDay, getDaysAgo } from '../utils/dateUtils';
import { saveData, loadData, STORAGE_KEYS } from '../utils/storage';

interface GameState {
    // Core stats
    totalXP: number;
    activities: ActivityEntry[];
    lastActiveDate: string;
    streakDays: number;

    // Derived state (computed)
    currentLevel: Level;
    avatarState: AvatarState;
    todayXP: number;

    // Actions
    addActivity: (type: ActivityType, value: number) => void;
    addXP: (xp: number) => void; // Direct XP modification (for alarms, etc.)
    loadState: () => Promise<void>;
    resetState: () => void;

    // Computed getters
    getTodayActivities: () => ActivityEntry[];
    getWeeklyXP: () => { date: string; xp: number }[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateTodayXP = (activities: ActivityEntry[]): number => {
    const today = getTodayDateString();
    return activities
        .filter(a => a.date === today)
        .reduce((sum, a) => sum + a.xpGained, 0);
};

const calculateStreak = (activities: ActivityEntry[], lastActiveDate: string): number => {
    const today = getTodayDateString();

    // If no activity yet today, check if we were active yesterday
    if (lastActiveDate !== today) {
        const yesterday = getDaysAgo(1);
        if (lastActiveDate !== yesterday) {
            return 0; // Streak broken
        }
    }

    // Count consecutive days with positive XP
    let streak = 0;
    let checkDate = today;

    for (let i = 0; i < 365; i++) {
        const dayActivities = activities.filter(a => a.date === checkDate);
        const dayXP = dayActivities.reduce((sum, a) => sum + a.xpGained, 0);

        if (dayXP > 0) {
            streak++;
            checkDate = getDaysAgo(i + 1);
        } else if (i === 0) {
            // Today has no positive XP yet, check yesterday
            checkDate = getDaysAgo(1);
        } else {
            break;
        }
    }

    return streak;
};

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    totalXP: 0,
    activities: [],
    lastActiveDate: getTodayDateString(),
    streakDays: 0,
    currentLevel: getLevelForXP(0),
    avatarState: 'tired',
    todayXP: 0,

    addActivity: (type: ActivityType, value: number) => {
        const xpGained = calculateXP(type, value);
        const today = getTodayDateString();

        const newActivity: ActivityEntry = {
            id: generateId(),
            type,
            value,
            xpGained,
            timestamp: Date.now(),
            date: today,
        };

        set((state) => {
            const newActivities = [...state.activities, newActivity];
            const newTotalXP = Math.max(0, state.totalXP + xpGained);
            const newTodayXP = calculateTodayXP(newActivities);
            const newStreak = calculateStreak(newActivities, today);

            const newState = {
                activities: newActivities,
                totalXP: newTotalXP,
                lastActiveDate: today,
                streakDays: newStreak,
                currentLevel: getLevelForXP(newTotalXP),
                avatarState: getAvatarState(newTodayXP),
                todayXP: newTodayXP,
            };

            // Persist state
            saveData(STORAGE_KEYS.GAME_STATE, {
                totalXP: newState.totalXP,
                activities: newState.activities,
                lastActiveDate: newState.lastActiveDate,
                streakDays: newState.streakDays,
            });

            return newState;
        });
    },

    addXP: (xp: number) => {
        const today = getTodayDateString();

        set((state) => {
            const newTotalXP = Math.max(0, state.totalXP + xp);
            const newTodayXP = state.todayXP + xp;

            const newState = {
                totalXP: newTotalXP,
                todayXP: newTodayXP,
                lastActiveDate: today,
                currentLevel: getLevelForXP(newTotalXP),
                avatarState: getAvatarState(newTodayXP),
            };

            // Persist state
            saveData(STORAGE_KEYS.GAME_STATE, {
                totalXP: newState.totalXP,
                activities: state.activities,
                lastActiveDate: newState.lastActiveDate,
                streakDays: state.streakDays,
            });

            return newState;
        });
    },

    loadState: async () => {
        const savedState = await loadData<{
            totalXP: number;
            activities: ActivityEntry[];
            lastActiveDate: string;
            streakDays: number;
        }>(STORAGE_KEYS.GAME_STATE);

        if (savedState) {
            const todayXP = calculateTodayXP(savedState.activities);
            const streak = calculateStreak(savedState.activities, savedState.lastActiveDate);

            set({
                totalXP: savedState.totalXP,
                activities: savedState.activities,
                lastActiveDate: savedState.lastActiveDate,
                streakDays: streak,
                currentLevel: getLevelForXP(savedState.totalXP),
                avatarState: getAvatarState(todayXP),
                todayXP,
            });
        }
    },

    resetState: () => {
        set({
            totalXP: 0,
            activities: [],
            lastActiveDate: getTodayDateString(),
            streakDays: 0,
            currentLevel: getLevelForXP(0),
            avatarState: 'tired',
            todayXP: 0,
        });
        saveData(STORAGE_KEYS.GAME_STATE, null);
    },

    getTodayActivities: () => {
        const today = getTodayDateString();
        return get().activities.filter(a => a.date === today);
    },

    getWeeklyXP: () => {
        const activities = get().activities;
        const weekData: { date: string; xp: number }[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = getDaysAgo(i);
            const dayXP = activities
                .filter(a => a.date === date)
                .reduce((sum, a) => sum + a.xpGained, 0);
            weekData.push({ date, xp: dayXP });
        }

        return weekData;
    },
}));
