// Level system configuration
export interface Level {
    level: number;
    title: string;
    minXP: number;
    maxXP: number;
}

export const LEVELS: Level[] = [
    { level: 1, title: 'Newborn', minXP: 0, maxXP: 100 },
    { level: 2, title: 'Apprentice', minXP: 101, maxXP: 300 },
    { level: 3, title: 'Journeyman', minXP: 301, maxXP: 600 },
    { level: 4, title: 'Adept', minXP: 601, maxXP: 1000 },
    { level: 5, title: 'Expert', minXP: 1001, maxXP: 1500 },
    { level: 6, title: 'Master', minXP: 1501, maxXP: 2100 },
    { level: 7, title: 'Legend', minXP: 2101, maxXP: 2800 },
    { level: 8, title: 'Mythic', minXP: 2801, maxXP: 3600 },
    { level: 9, title: 'Immortal', minXP: 3601, maxXP: 4500 },
    { level: 10, title: 'Transcendent', minXP: 4501, maxXP: Infinity },
];

export function getLevelForXP(totalXP: number): Level {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVELS[i].minXP) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

export function getProgressToNextLevel(totalXP: number): {
    currentXP: number;
    requiredXP: number;
    progress: number;
} {
    const currentLevel = getLevelForXP(totalXP);
    const nextLevelIndex = Math.min(currentLevel.level, LEVELS.length - 1);
    const nextLevel = LEVELS[nextLevelIndex];

    if (currentLevel.level >= LEVELS.length) {
        return { currentXP: totalXP, requiredXP: totalXP, progress: 1 };
    }

    const xpIntoLevel = totalXP - currentLevel.minXP;
    const xpNeededForLevel = nextLevel.minXP - currentLevel.minXP;
    const progress = xpNeededForLevel > 0 ? xpIntoLevel / xpNeededForLevel : 1;

    return {
        currentXP: xpIntoLevel,
        requiredXP: xpNeededForLevel,
        progress: Math.min(progress, 1),
    };
}
