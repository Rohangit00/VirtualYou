import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { getProgressToNextLevel } from '../../utils/levelSystem';

interface XPProgressProps {
    totalXP: number;
    todayXP: number;
}

export function XPProgress({ totalXP, todayXP }: XPProgressProps) {
    const progress = getProgressToNextLevel(totalXP);
    const progressPercentage = Math.min(progress.progress * 100, 100);

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

                {/* Header with icon */}
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>⚡</Text>
                    <Text style={styles.headerTitle}>EXPERIENCE</Text>
                </View>

                {/* Total XP Display */}
                <View style={styles.xpDisplay}>
                    <Text style={styles.xpValue}>{totalXP.toLocaleString()}</Text>
                    <Text style={styles.xpLabel}>TOTAL XP</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarOuter}>
                        <LinearGradient
                            colors={['#1E1B4B', '#312E81']}
                            style={styles.progressBarBg}
                        >
                            <View style={styles.progressBarInner}>
                                <LinearGradient
                                    colors={['#FBBF24', '#F59E0B', '#D97706']}
                                    style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {/* Shine effect on progress */}
                                    <View style={styles.progressShine} />
                                </LinearGradient>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Progress text */}
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressText}>
                            {progress.currentXP} / {progress.requiredXP}
                        </Text>
                        <Text style={styles.progressPercent}>
                            {Math.round(progressPercentage)}%
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <LinearGradient
                    colors={['transparent', COLORS.border, 'transparent']}
                    style={styles.divider}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />

                {/* Today's XP */}
                <View style={styles.todayContainer}>
                    <View style={styles.todayLeft}>
                        <Text style={styles.todayIcon}>📅</Text>
                        <Text style={styles.todayLabel}>Today's Progress</Text>
                    </View>
                    <View style={[
                        styles.todayBadge,
                        { backgroundColor: todayXP >= 0 ? COLORS.xpPositiveGlow : COLORS.xpNegativeGlow }
                    ]}>
                        <Text style={[
                            styles.todayValue,
                            { color: todayXP >= 0 ? COLORS.xpPositive : COLORS.xpNegative }
                        ]}>
                            {todayXP >= 0 ? '+' : ''}{todayXP} XP
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
    cornerTL: {
        top: 8,
        left: 8,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    cornerTR: {
        top: 8,
        right: 8,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    cornerBL: {
        bottom: 8,
        left: 8,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    cornerBR: {
        bottom: 8,
        right: 8,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
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
    xpDisplay: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    xpValue: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.accent,
        textShadowColor: COLORS.accentGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    xpLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        letterSpacing: 2,
        marginTop: SPACING.xs,
    },
    progressContainer: {
        marginBottom: SPACING.lg,
    },
    progressBarOuter: {
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 2,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    progressBarBg: {
        height: 20,
        borderRadius: BORDER_RADIUS.full,
        padding: 3,
    },
    progressBarInner: {
        flex: 1,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: BORDER_RADIUS.full,
        position: 'relative',
        overflow: 'hidden',
    },
    progressShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
    },
    progressText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
    progressPercent: {
        ...FONTS.caption,
        color: COLORS.textGold,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        marginBottom: SPACING.md,
    },
    todayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    todayLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    todayIcon: {
        fontSize: 16,
        marginRight: SPACING.sm,
    },
    todayLabel: {
        ...FONTS.body,
        color: COLORS.textSecondary,
    },
    todayBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    todayValue: {
        ...FONTS.subheading,
        fontWeight: '800',
    },
});
