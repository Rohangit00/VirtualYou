import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { ActivityType, calculateXP } from '../../utils/xpCalculator';
import * as Haptics from 'expo-haptics';

interface QuickActionsProps {
    onAddActivity: (type: ActivityType, value: number) => void;
}

interface ActivityConfig {
    type: ActivityType;
    emoji: string;
    label: string;
    unit: string;
    defaultValue: number;
    step: number;
    isNegative?: boolean;
    gradient: string[];
    icon: string;
}

const ACTIVITY_CONFIGS: ActivityConfig[] = [
    {
        type: 'steps',
        emoji: '🚶',
        icon: '👟',
        label: 'Steps',
        unit: 'steps',
        defaultValue: 1000,
        step: 500,
        gradient: ['#059669', '#10B981', '#34D399'],
    },
    {
        type: 'focus',
        emoji: '🧠',
        icon: '🎯',
        label: 'Focus',
        unit: 'min',
        defaultValue: 30,
        step: 15,
        gradient: ['#2563EB', '#3B82F6', '#60A5FA'],
    },
    {
        type: 'gym',
        emoji: '🏋️',
        icon: '💪',
        label: 'Gym',
        unit: 'session',
        defaultValue: 1,
        step: 1,
        gradient: ['#7C3AED', '#8B5CF6', '#A78BFA'],
    },
    {
        type: 'screenTime',
        emoji: '📱',
        icon: '📵',
        label: 'Screen',
        unit: 'hours',
        defaultValue: 4,
        step: 1,
        isNegative: true,
        gradient: ['#DC2626', '#EF4444', '#F87171'],
    },
];

export function QuickActions({ onAddActivity }: QuickActionsProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<ActivityConfig | null>(null);
    const [inputValue, setInputValue] = useState('');

    const handleActivityPress = (config: ActivityConfig) => {
        setSelectedActivity(config);
        setInputValue(config.defaultValue.toString());
        setModalVisible(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleConfirm = () => {
        if (selectedActivity && inputValue) {
            const value = parseFloat(inputValue);
            if (!isNaN(value) && value > 0) {
                onAddActivity(selectedActivity.type, value);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        }
        setModalVisible(false);
        setSelectedActivity(null);
    };

    const getPreviewXP = (): number => {
        if (!selectedActivity || !inputValue) return 0;
        const value = parseFloat(inputValue);
        if (isNaN(value)) return 0;
        return calculateXP(selectedActivity.type, value);
    };

    const previewXP = getPreviewXP();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(20, 18, 35, 0.95)', 'rgba(30, 28, 50, 0.9)']}
                style={styles.cardGradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>⚔️</Text>
                    <Text style={styles.headerTitle}>LOG ACTIVITY</Text>
                </View>

                {/* Action Buttons Grid */}
                <View style={styles.actionsGrid}>
                    {ACTIVITY_CONFIGS.map((config) => (
                        <TouchableOpacity
                            key={config.type}
                            style={styles.actionButtonContainer}
                            onPress={() => handleActivityPress(config)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={config.gradient as any}
                                style={[
                                    styles.actionButton,
                                    config.isNegative && styles.negativeButton,
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {/* Shine effect */}
                                <View style={styles.buttonShine} />

                                <Text style={styles.actionEmoji}>{config.emoji}</Text>
                                <Text style={styles.actionLabel}>{config.label}</Text>

                                {/* XP indicator */}
                                <View style={styles.xpIndicator}>
                                    <Text style={styles.xpIndicatorText}>
                                        {config.isNegative ? '-' : '+'}XP
                                    </Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            {/* Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable style={styles.modalWrapper} onPress={e => e.stopPropagation()}>
                        <LinearGradient
                            colors={['#1E1B4B', '#312E81', '#1E1B4B']}
                            style={styles.modalContent}
                        >
                            {/* Ornate corners */}
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />

                            {selectedActivity && (
                                <>
                                    {/* Header */}
                                    <LinearGradient
                                        colors={selectedActivity.gradient as any}
                                        style={styles.modalHeader}
                                    >
                                        <Text style={styles.modalEmoji}>{selectedActivity.emoji}</Text>
                                    </LinearGradient>

                                    <Text style={styles.modalTitle}>Log {selectedActivity.label}</Text>

                                    {/* Input section */}
                                    <View style={styles.inputContainer}>
                                        <TouchableOpacity
                                            style={styles.stepButton}
                                            onPress={() => {
                                                const current = parseFloat(inputValue) || 0;
                                                setInputValue(Math.max(0, current - selectedActivity.step).toString());
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            <LinearGradient
                                                colors={['#374151', '#4B5563']}
                                                style={styles.stepButtonGradient}
                                            >
                                                <Text style={styles.stepButtonText}>−</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.input}
                                                value={inputValue}
                                                onChangeText={setInputValue}
                                                keyboardType="numeric"
                                                selectTextOnFocus
                                            />
                                            <Text style={styles.unitLabel}>{selectedActivity.unit}</Text>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.stepButton}
                                            onPress={() => {
                                                const current = parseFloat(inputValue) || 0;
                                                setInputValue((current + selectedActivity.step).toString());
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            <LinearGradient
                                                colors={['#374151', '#4B5563']}
                                                style={styles.stepButtonGradient}
                                            >
                                                <Text style={styles.stepButtonText}>+</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>

                                    {/* XP Preview */}
                                    <View style={[
                                        styles.previewContainer,
                                        { backgroundColor: previewXP >= 0 ? COLORS.xpPositiveGlow : COLORS.xpNegativeGlow }
                                    ]}>
                                        <Text style={styles.previewLabel}>XP Reward</Text>
                                        <Text style={[
                                            styles.previewXP,
                                            { color: previewXP >= 0 ? COLORS.xpPositive : COLORS.xpNegative }
                                        ]}>
                                            {previewXP >= 0 ? '+' : ''}{previewXP} XP
                                        </Text>
                                    </View>

                                    {/* Buttons */}
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.confirmButtonContainer}
                                            onPress={handleConfirm}
                                        >
                                            <LinearGradient
                                                colors={selectedActivity.gradient as any}
                                                style={styles.confirmButton}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                <Text style={styles.confirmButtonText}>⚔️ Claim XP</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>
                </Pressable>
            </Modal>
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
    },
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
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButtonContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    actionButton: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    negativeButton: {
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    buttonShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    actionEmoji: {
        fontSize: 32,
        marginBottom: SPACING.xs,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    actionLabel: {
        ...FONTS.caption,
        color: COLORS.text,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    xpIndicator: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    xpIndicatorText: {
        fontSize: 9,
        color: COLORS.text,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalWrapper: {
        width: '100%',
        maxWidth: 400,
    },
    modalContent: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: COLORS.borderGold,
    },
    cornerTL: { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
    cornerTR: { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
    cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
    cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },
    modalHeader: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    modalEmoji: {
        fontSize: 40,
    },
    modalTitle: {
        ...FONTS.heading,
        color: COLORS.text,
        marginBottom: SPACING.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    stepButton: {
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    stepButtonGradient: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    stepButtonText: {
        fontSize: 28,
        color: COLORS.text,
        fontWeight: '600',
    },
    inputWrapper: {
        alignItems: 'center',
        marginHorizontal: SPACING.xl,
    },
    input: {
        fontSize: 56,
        fontWeight: '800',
        color: COLORS.accent,
        textAlign: 'center',
        minWidth: 140,
        textShadowColor: COLORS.accentGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    unitLabel: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
        textTransform: 'uppercase',
    },
    previewContainer: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    previewLabel: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginBottom: SPACING.xs,
    },
    previewXP: {
        fontSize: 32,
        fontWeight: '800',
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        ...FONTS.body,
        color: COLORS.textSecondary,
    },
    confirmButtonContainer: {
        flex: 1,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    confirmButton: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.lg,
    },
    confirmButtonText: {
        ...FONTS.body,
        color: COLORS.text,
        fontWeight: '700',
    },
});
