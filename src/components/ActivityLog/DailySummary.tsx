import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { ActivityEntry, ActivityType } from '../../utils/xpCalculator';

interface DailySummaryProps {
    activities: ActivityEntry[];
}

const ACTIVITY_CONFIG: Record<ActivityType, { emoji: string; label: string; gradient: string[] }> = {
    steps: { emoji: '🚶', label: 'Steps', gradient: ['#059669', '#10B981'] },
    focus: { emoji: '🧠', label: 'Focus Time', gradient: ['#2563EB', '#3B82F6'] },
    gym: { emoji: '🏋️', label: 'Gym Session', gradient: ['#7C3AED', '#8B5CF6'] },
    sleep: { emoji: '😴', label: 'Sleep', gradient: ['#6366F1', '#818CF8'] },
    screenTime: { emoji: '📱', label: 'Screen Time', gradient: ['#DC2626', '#EF4444'] },
};

export function DailySummary({ activities }: DailySummaryProps) {
    const totalPositive = activities
        .filter(a => a.xpGained > 0)
        .reduce((sum, a) => sum + a.xpGained, 0);

    const totalNegative = activities
        .filter(a => a.xpGained < 0)
        .reduce((sum, a) => sum + a.xpGained, 0);

    if (activities.length === 0) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['rgba(20, 18, 35, 0.95)', 'rgba(30, 28, 50, 0.9)']}
                    style={styles.cardGradient}
                >
                    {/* Ornate corners */}
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />

                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>📜</Text>
                        <Text style={styles.headerTitle}>QUEST LOG</Text>
                    </View>

                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>⚔️</Text>
                        <Text style={styles.emptyTitle}>No Quests Completed</Text>
                        <Text style={styles.emptySubtext}>Begin your journey by logging an activity!</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(20, 18, 35, 0.95)', 'rgba(30, 28, 50, 0.9)']}
                style={styles.cardGradient}
            >
                {/* Ornate corners */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />

                {/* Header with totals */}
                <View style={styles.headerRow}>
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>📜</Text>
                        <Text style={styles.headerTitle}>QUEST LOG</Text>
                    </View>
                    <View style={styles.totals}>
                        {totalPositive > 0 && (
                            <View style={[styles.totalBadge, { backgroundColor: COLORS.xpPositiveGlow }]}>
                                <Text style={[styles.totalText, { color: COLORS.xpPositive }]}>+{totalPositive}</Text>
                            </View>
                        )}
                        {totalNegative < 0 && (
                            <View style={[styles.totalBadge, { backgroundColor: COLORS.xpNegativeGlow }]}>
                                <Text style={[styles.totalText, { color: COLORS.xpNegative }]}>{totalNegative}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {activities.slice().reverse().map((activity, index) => {
                        const config = ACTIVITY_CONFIG[activity.type];
                        const isPositive = activity.xpGained >= 0;

                        return (
                            <View key={activity.id} style={styles.activityRow}>
                                {/* Activity icon with gradient */}
                                <LinearGradient
                                    colors={config.gradient as any}
                                    style={styles.activityIcon}
                                >
                                    <Text style={styles.activityEmoji}>{config.emoji}</Text>
                                </LinearGradient>

                                {/* Activity info */}
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityLabel}>{config.label}</Text>
                                    <Text style={styles.activityValue}>
                                        {activity.value} {activity.type === 'steps' ? 'steps' :
                                            activity.type === 'focus' ? 'min' :
                                                activity.type === 'gym' ? 'session' :
                                                    activity.type === 'screenTime' ? 'hours' : ''}
                                    </Text>
                                </View>

                                {/* XP gained */}
                                <View style={[
                                    styles.xpBadge,
                                    { backgroundColor: isPositive ? COLORS.xpPositiveGlow : COLORS.xpNegativeGlow }
                                ]}>
                                    <Text style={[
                                        styles.xpGained,
                                        { color: isPositive ? COLORS.xpPositive : COLORS.xpNegative }
                                    ]}>
                                        {isPositive ? '+' : ''}{activity.xpGained}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.card,
        overflow: 'hidden',
        maxHeight: 280,
        ...SHADOWS.card,
    },
    cardGradient: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: COLORS.borderGold,
        zIndex: 1,
    },
    cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
    cornerTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
    cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
    cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 18,
        marginRight: SPACING.sm,
    },
    headerTitle: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        letterSpacing: 3,
        fontWeight: '700',
    },
    totals: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    totalBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
    },
    totalText: {
        ...FONTS.caption,
        fontWeight: '700',
    },
    scrollView: {
        flexGrow: 0,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139, 92, 246, 0.1)',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activityEmoji: {
        fontSize: 20,
    },
    activityInfo: {
        flex: 1,
    },
    activityLabel: {
        ...FONTS.body,
        color: COLORS.text,
        fontWeight: '600',
    },
    activityValue: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
    xpBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    xpGained: {
        ...FONTS.body,
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        ...FONTS.subheading,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        ...FONTS.body,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});
