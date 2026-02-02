import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    GAME_STATE: '@virtualyou_game_state',
    ACTIVITIES: '@virtualyou_activities',
} as const;

export async function saveData<T>(key: string, data: T): Promise<void> {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

export async function loadData<T>(key: string): Promise<T | null> {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error loading data:', e);
        return null;
    }
}

export async function clearAllData(): Promise<void> {
    try {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (e) {
        console.error('Error clearing data:', e);
    }
}

export { STORAGE_KEYS };
