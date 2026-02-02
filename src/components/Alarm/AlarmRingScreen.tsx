import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Vibration,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { useAlarmStore } from '../../store/alarmStore';
import { useGameStore } from '../../store/gameStore';
import { Alarm, ALARM_TIMING, ALARM_XP, calculateAlarmXP } from '../../utils/alarmTypes';
import { scheduleSnoozeNotification } from '../../utils/alarmNotifications';
import * as Haptics from 'expo-haptics';

interface AlarmRingScreenProps {
    alarm: Alarm;
    onDismiss: () => void;
    startTime: number; // timestamp when alarm started ringing
}

export function AlarmRingScreen({ alarm, onDismiss, startTime }: AlarmRingScreenProps) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [snoozeCount, setSnoozeCount] = useState(0);
    const { recordAlarmResponse } = useAlarmStore();
    const { addXP } = useGameStore();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Calculate potential XP
    const { type, xp } = calculateAlarmXP(elapsedMs, false);
    const isQuickDismiss = elapsedMs <= ALARM_TIMING.QUICK_DISMISS_MS;
    const quickDismissRemaining = Math.max(0, ALARM_TIMING.QUICK_DISMISS_MS - elapsedMs);

    useEffect(() => {
        // Update elapsed time
        const interval = setInterval(() => {
            setElapsedMs(Date.now() - startTime);
        }, 100);

        // Start vibration pattern
        const vibrationPattern = [500, 500, 500, 500];
        Vibration.vibrate(vibrationPattern, true);

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Shake animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        return () => {
            clearInterval(interval);
            Vibration.cancel();
        };
    }, [startTime]);

    const handleDismiss = async () => {
        Vibration.cancel();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const { type, xp } = calculateAlarmXP(elapsedMs, false);

        // Record response and add XP
        recordAlarmResponse(alarm.id, type, elapsedMs);
        addXP(xp);

        onDismiss();
    };

    const handleSnooze = async () => {
        Vibration.cancel();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        setSnoozeCount(snoozeCount + 1);

        // Record snooze and penalize XP
        recordAlarmResponse(alarm.id, 'snoozed', elapsedMs);
        addXP(ALARM_XP.SNOOZED);

        // Schedule snooze notification
        await scheduleSnoozeNotification(alarm);

        onDismiss();
    };

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F0A1F', '#1E1B4B', '#0F0A1F']}
                style={styles.background}
            >
                {/* Animated clock icon */}
                <Animated.View
                    style={[
                        styles.clockContainer,
                        {
                            transform: [
                                { scale: pulseAnim },
                                { translateX: shakeAnim },
                            ],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['#FBBF24', '#F59E0B', '#D97706']}
                        style={styles.clockBadge}
                    >
                        <Text style={styles.clockEmoji}>⏰</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Title */}
                <Text style={styles.title}>WAKE UP, WARRIOR!</Text>
                <Text style={styles.alarmLabel}>{alarm.label}</Text>

                {/* Elapsed time */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Time elapsed</Text>
                    <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>
                </View>

                {/* Quick dismiss countdown */}
                {isQuickDismiss && (
                    <View style={styles.quickDismissContainer}>
                        <LinearGradient
                            colors={['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)']}
                            style={styles.quickDismissGradient}
                        >
                            <Text style={styles.quickDismissText}>
                                ⚡ Quick dismiss in {Math.ceil(quickDismissRemaining / 1000)}s
                            </Text>
                            <Text style={styles.quickDismissXP}>+25 XP</Text>
                        </LinearGradient>
                    </View>
                )}

                {/* XP Preview */}
                <View style={styles.xpPreview}>
                    <Text style={styles.xpPreviewLabel}>Current reward:</Text>
                    <Text style={[
                        styles.xpPreviewValue,
                        { color: xp >= 15 ? COLORS.xpPositive : xp >= 5 ? COLORS.warning : COLORS.textMuted }
                    ]}>
                        +{xp} XP
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                    {/* Snooze Button */}
                    <TouchableOpacity
                        style={styles.snoozeButtonContainer}
                        onPress={handleSnooze}
                    >
                        <LinearGradient
                            colors={['#7F1D1D', '#DC2626', '#EF4444']}
                            style={styles.snoozeButton}
                        >
                            <Text style={styles.snoozeEmoji}>💀</Text>
                            <Text style={styles.snoozeText}>SNOOZE</Text>
                            <Text style={styles.snoozePenalty}>-10 XP</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Dismiss Button */}
                    <TouchableOpacity
                        style={styles.dismissButtonContainer}
                        onPress={handleDismiss}
                    >
                        <LinearGradient
                            colors={['#065F46', '#10B981', '#34D399']}
                            style={styles.dismissButton}
                        >
                            <Text style={styles.dismissEmoji}>🛡️</Text>
                            <Text style={styles.dismissText}>DISMISS</Text>
                            <Text style={styles.dismissReward}>+{xp} XP</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Snooze warning */}
                {snoozeCount > 0 && (
                    <View style={styles.snoozeWarning}>
                        <Text style={styles.snoozeWarningText}>
                            ⚠️ You've snoozed {snoozeCount} time{snoozeCount > 1 ? 's' : ''} today
                        </Text>
                    </View>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    clockContainer: {
        marginBottom: SPACING.xl,
    },
    clockBadge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...SHADOWS.goldGlow,
    },
    clockEmoji: {
        fontSize: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textGold,
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: SPACING.sm,
        textShadowColor: COLORS.accentGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    alarmLabel: {
        ...FONTS.subheading,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    timerLabel: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        letterSpacing: 2,
    },
    timer: {
        fontSize: 56,
        fontWeight: '800',
        color: COLORS.text,
    },
    quickDismissContainer: {
        marginBottom: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    quickDismissGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.xpPositive,
        gap: SPACING.sm,
    },
    quickDismissText: {
        ...FONTS.body,
        color: COLORS.xpPositive,
        fontWeight: '600',
    },
    quickDismissXP: {
        ...FONTS.subheading,
        color: COLORS.xpPositive,
        fontWeight: '800',
    },
    xpPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.sm,
    },
    xpPreviewLabel: {
        ...FONTS.body,
        color: COLORS.textMuted,
    },
    xpPreviewValue: {
        ...FONTS.heading,
        fontWeight: '800',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: SPACING.lg,
        width: '100%',
        maxWidth: 400,
    },
    snoozeButtonContainer: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    snoozeButton: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 2,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    snoozeEmoji: {
        fontSize: 40,
        marginBottom: SPACING.sm,
    },
    snoozeText: {
        ...FONTS.subheading,
        color: COLORS.text,
        fontWeight: '700',
    },
    snoozePenalty: {
        ...FONTS.caption,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: SPACING.xs,
    },
    dismissButtonContainer: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    dismissButton: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 2,
        borderColor: 'rgba(52, 211, 153, 0.5)',
    },
    dismissEmoji: {
        fontSize: 40,
        marginBottom: SPACING.sm,
    },
    dismissText: {
        ...FONTS.subheading,
        color: COLORS.text,
        fontWeight: '700',
    },
    dismissReward: {
        ...FONTS.caption,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: SPACING.xs,
    },
    snoozeWarning: {
        marginTop: SPACING.xl,
        padding: SPACING.md,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    snoozeWarningText: {
        ...FONTS.body,
        color: COLORS.xpNegative,
        textAlign: 'center',
    },
});
