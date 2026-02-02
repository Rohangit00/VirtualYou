import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';

interface WeeklyChartProps {
    data: { date: string; xp: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
    const maxXP = Math.max(...data.map(d => Math.abs(d.xp)), 1);
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>📊</Text>
                    <Text style={styles.headerTitle}>WEEKLY PROGRESS</Text>
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                    {/* Grid lines */}
                    <View style={styles.gridLines}>
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                    </View>

                    {/* Bars */}
                    <View style={styles.barsContainer}>
                        {data.map((day, index) => {
                            const height = Math.max((Math.abs(day.xp) / maxXP) * 100, 8);
                            const isPositive = day.xp >= 0;
                            const isToday = index === data.length - 1;

                            const barGradient = isPositive
                                ? ['#059669', '#10B981', '#34D399']
                                : ['#DC2626', '#EF4444', '#F87171'];

                            return (
                                <View key={day.date} style={styles.barColumn}>
                                    <View style={styles.barWrapper}>
                                        <View style={[styles.barContainer, { height }]}>
                                            <LinearGradient
                                                colors={barGradient as any}
                                                style={styles.bar}
                                                start={{ x: 0, y: 1 }}
                                                end={{ x: 0, y: 0 }}
                                            >
                                                {/* Shine */}
                                                <View style={styles.barShine} />
                                            </LinearGradient>
                                        </View>

                                        {/* XP label */}
                                        <Text style={[
                                            styles.xpLabel,
                                            { color: isPositive ? COLORS.xpPositive : COLORS.xpNegative }
                                        ]}>
                                            {day.xp > 0 ? '+' : ''}{day.xp}
                                        </Text>
                                    </View>

                                    {/* Day label */}
                                    <View style={[
                                        styles.dayBadge,
                                        isToday && styles.todayBadge,
                                    ]}>
                                        <Text style={[
                                            styles.dayLabel,
                                            isToday && styles.todayLabel,
                                        ]}>
                                            {weekDays[index]}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Week</Text>
                        <Text style={[
                            styles.summaryValue,
                            { color: data.reduce((sum, d) => sum + d.xp, 0) >= 0 ? COLORS.xpPositive : COLORS.xpNegative }
                        ]}>
                            {data.reduce((sum, d) => sum + d.xp, 0) >= 0 ? '+' : ''}
                            {data.reduce((sum, d) => sum + d.xp, 0)} XP
                        </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Best Day</Text>
                        <Text style={[styles.summaryValue, { color: COLORS.textGold }]}>
                            +{Math.max(...data.map(d => d.xp), 0)} XP
                        </Text>
                    </View>
                </View>
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
    },
    cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
    cornerTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
    cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
    cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
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
    chartContainer: {
        height: 160,
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    gridLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 30,
        justifyContent: 'space-between',
    },
    gridLine: {
        height: 1,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 30,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
    },
    barWrapper: {
        alignItems: 'center',
        height: 110,
        justifyContent: 'flex-end',
    },
    barContainer: {
        width: 28,
        borderRadius: BORDER_RADIUS.sm,
        overflow: 'hidden',
        minHeight: 8,
    },
    bar: {
        flex: 1,
        borderRadius: BORDER_RADIUS.sm,
        position: 'relative',
        overflow: 'hidden',
    },
    barShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    xpLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    dayBadge: {
        marginTop: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    todayBadge: {
        backgroundColor: COLORS.primary,
    },
    dayLabel: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    todayLabel: {
        color: COLORS.text,
    },
    summary: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    summaryLabel: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    summaryValue: {
        ...FONTS.subheading,
        fontWeight: '800',
    },
});
