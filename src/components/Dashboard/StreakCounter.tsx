import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';

interface StreakCounterProps {
    streakDays: number;
}

export function StreakCounter({ streakDays }: StreakCounterProps) {
    const getStreakTier = (days: number) => {
        if (days >= 30) return { emoji: '🏆', label: 'LEGENDARY', color: '#FBBF24', gradient: ['#92400E', '#D97706', '#FBBF24'] };
        if (days >= 14) return { emoji: '⚡', label: 'EPIC', color: '#A855F7', gradient: ['#581C87', '#7C3AED', '#A855F7'] };
        if (days >= 7) return { emoji: '🔥', label: 'RARE', color: '#F97316', gradient: ['#9A3412', '#EA580C', '#FB923C'] };
        if (days >= 3) return { emoji: '✨', label: 'UNCOMMON', color: '#22D3EE', gradient: ['#0E7490', '#06B6D4', '#67E8F9'] };
        if (days >= 1) return { emoji: '🌱', label: 'COMMON', color: '#4ADE80', gradient: ['#166534', '#22C55E', '#86EFAC'] };
        return { emoji: '💤', label: 'INACTIVE', color: '#6B7280', gradient: ['#374151', '#4B5563', '#6B7280'] };
    };

    const tier = getStreakTier(streakDays);
    const bonusPercent = Math.min(streakDays * 10, 50);

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
                    <Text style={styles.headerIcon}>🔥</Text>
                    <Text style={styles.headerTitle}>STREAK</Text>
                </View>

                <View style={styles.content}>
                    {/* Streak Badge */}
                    <View style={styles.badgeContainer}>
                        <LinearGradient
                            colors={tier.gradient as any}
                            style={styles.streakBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.badgeShine} />
                            <Text style={styles.badgeEmoji}>{tier.emoji}</Text>
                            <Text style={styles.streakNumber}>{streakDays}</Text>
                            <Text style={styles.streakLabel}>DAYS</Text>
                        </LinearGradient>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        {/* Tier label */}
                        <View style={[styles.tierBadge, { borderColor: tier.color }]}>
                            <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
                        </View>

                        {/* Bonus display */}
                        {streakDays > 0 && (
                            <View style={styles.bonusContainer}>
                                <LinearGradient
                                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                                    style={styles.bonusGradient}
                                >
                                    <Text style={styles.bonusIcon}>⬆️</Text>
                                    <View style={styles.bonusTextContainer}>
                                        <Text style={styles.bonusValue}>+{bonusPercent}%</Text>
                                        <Text style={styles.bonusLabel}>XP BONUS</Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        )}

                        {/* Next tier hint */}
                        {streakDays < 30 && streakDays > 0 && (
                            <Text style={styles.nextTierHint}>
                                {streakDays < 3 ? `${3 - streakDays} more for Uncommon` :
                                    streakDays < 7 ? `${7 - streakDays} more for Rare` :
                                        streakDays < 14 ? `${14 - streakDays} more for Epic` :
                                            `${30 - streakDays} more for Legendary`}
                            </Text>
                        )}
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
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeContainer: {
        marginRight: SPACING.xl,
    },
    streakBadge: {
        width: 100,
        height: 100,
        borderRadius: BORDER_RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        position: 'relative',
        overflow: 'hidden',
    },
    badgeShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeEmoji: {
        fontSize: 28,
        marginBottom: 2,
    },
    streakNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    streakLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2,
    },
    infoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    tierBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        marginBottom: SPACING.md,
    },
    tierText: {
        ...FONTS.caption,
        fontWeight: '800',
        letterSpacing: 2,
    },
    bonusContainer: {
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
    },
    bonusGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    bonusIcon: {
        fontSize: 20,
        marginRight: SPACING.sm,
    },
    bonusTextContainer: {
        flex: 1,
    },
    bonusValue: {
        ...FONTS.subheading,
        color: COLORS.xpPositive,
        fontWeight: '800',
    },
    bonusLabel: {
        fontSize: 10,
        color: COLORS.textMuted,
        letterSpacing: 1,
    },
    nextTierHint: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontStyle: 'italic',
    },
});
