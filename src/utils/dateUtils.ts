export function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export function getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

export function getWeekDates(): string[] {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        dates.push(getDaysAgo(i));
    }
    return dates;
}

export function isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}
