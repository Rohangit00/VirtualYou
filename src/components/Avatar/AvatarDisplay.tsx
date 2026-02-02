import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { AvatarState, AVATAR_STATES } from '../../utils/avatarStates';
import { Level } from '../../utils/levelSystem';

interface AvatarDisplayProps {
    state: AvatarState;
    level: Level;
    size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
    small: 100,
    medium: 140,
    large: 200,
};

const STATE_GRADIENTS: Record<AvatarState, string[]> = {
    thriving: ['#FBBF24', '#F59E0B', '#D97706'],
    healthy: ['#34D399', '#10B981', '#059669'],
    tired: ['#60A5FA', '#3B82F6', '#2563EB'],
    drained: ['#9CA3AF', '#6B7280', '#4B5563'],
};

const STATE_ICONS: Record<AvatarState, string> = {
    thriving: '⚔️',
    healthy: '🛡️',
    tired: '💤',
    drained: '💀',
};

export function AvatarDisplay({ state, level, size = 'large' }: AvatarDisplayProps) {
    const stateConfig = AVATAR_STATES[state];
    const avatarSize = SIZE_MAP[size];
    const gradientColors = STATE_GRADIENTS[state];

    const glowColor = state === 'thriving' ? COLORS.thrivingGlow :
        state === 'healthy' ? COLORS.healthyGlow :
            state === 'tired' ? COLORS.tiredGlow : COLORS.drainedGlow;

    return (
        <View style={styles.container}>
            {/* Outer glow ring */}
            <View style={[styles.glowRing, {
                width: avatarSize + 40,
                height: avatarSize + 40,
                backgroundColor: glowColor,
            }]} />

            {/* Ornate frame */}
            <View style={[styles.ornateFrame, { width: avatarSize + 20, height: avatarSize + 20 }]}>
                <LinearGradient
                    colors={['rgba(139, 92, 246, 0.6)', 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.6)']}
                    style={styles.frameGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </View>

            {/* Avatar Container */}
            <View style={[
                styles.avatarContainer,
                { width: avatarSize, height: avatarSize },
                state === 'thriving' && SHADOWS.goldGlow,
            ]}>
                <LinearGradient
                    colors={gradientColors as any}
                    style={styles.avatarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Inner content */}
                    <View style={styles.avatarInner}>
                        <Text style={[styles.avatarIcon, { fontSize: avatarSize * 0.4 }]}>
                            {STATE_ICONS[state]}
                        </Text>
                    </View>

                    {/* Shine effect */}
                    <View style={styles.shineEffect} />
                </LinearGradient>
            </View>

            {/* Level Badge - Ornate */}
            <View style={styles.levelBadgeContainer}>
                <LinearGradient
                    colors={['#B45309', '#D97706', '#FBBF24', '#D97706', '#B45309']}
                    style={styles.levelBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.levelText}>LV</Text>
                    <Text style={styles.levelNumber}>{level.level}</Text>
                </LinearGradient>
            </View>

            {/* Title plate */}
            <View style={styles.titlePlate}>
                <LinearGradient
                    colors={['rgba(20, 18, 35, 0.9)', 'rgba(30, 28, 50, 0.9)']}
                    style={styles.titleGradient}
                >
                    <View style={styles.titleBorder}>
                        <Text style={styles.titleText}>{level.title}</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* State indicator */}
            <View style={[styles.stateContainer, { borderColor: stateConfig.color }]}>
                <Text style={styles.stateEmoji}>{stateConfig.emoji}</Text>
                <Text style={[styles.stateText, { color: stateConfig.color }]}>
                    {stateConfig.label}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: SPACING.lg,
        paddingVertical: SPACING.lg,
    },
    glowRing: {
        position: 'absolute',
        borderRadius: BORDER_RADIUS.full,
        opacity: 0.3,
    },
    ornateFrame: {
        position: 'absolute',
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
    },
    frameGradient: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    avatarContainer: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: COLORS.borderGold,
    },
    avatarGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarInner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    shineEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: '50%',
        bottom: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomRightRadius: 100,
    },
    levelBadgeContainer: {
        marginTop: -15,
        zIndex: 10,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 2,
        borderColor: '#92400E',
        ...SHADOWS.card,
    },
    levelText: {
        ...FONTS.caption,
        color: '#3D1F00',
        fontWeight: '800',
        marginRight: 4,
    },
    levelNumber: {
        ...FONTS.stat,
        fontSize: 24,
        color: '#3D1F00',
    },
    titlePlate: {
        marginTop: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    titleGradient: {
        borderRadius: BORDER_RADIUS.lg,
    },
    titleBorder: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
    },
    titleText: {
        ...FONTS.heading,
        color: COLORS.textGold,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(251, 191, 36, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    stateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    stateEmoji: {
        fontSize: 16,
        marginRight: SPACING.xs,
    },
    stateText: {
        ...FONTS.caption,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
