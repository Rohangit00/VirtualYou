import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { useAlarmStore } from '../../store/alarmStore';
import { Alarm, formatAlarmTime, getRepeatLabel, DAY_NAMES } from '../../utils/alarmTypes';
import {
    scheduleAlarmNotification,
    cancelAlarmNotification,
    requestNotificationPermissions,
} from '../../utils/alarmNotifications';
import * as Haptics from 'expo-haptics';

interface AlarmListProps {
    onAlarmTriggered?: (alarm: Alarm) => void;
}

export function AlarmList({ onAlarmTriggered }: AlarmListProps) {
    const { alarms, loadAlarms, addAlarm, deleteAlarm, toggleAlarm, updateAlarm } = useAlarmStore();
    const [showModal, setShowModal] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

    // Time picker state (12-hour format)
    const [selectedHour, setSelectedHour] = useState(7); // 1-12
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [isPM, setIsPM] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays
    const [alarmLabel, setAlarmLabel] = useState('Wake Up');

    useEffect(() => {
        loadAlarms();
        requestNotificationPermissions();
    }, []);

    // Convert 24-hour to 12-hour format
    const to12Hour = (hour24: number): { hour: number; isPM: boolean } => {
        const isPM = hour24 >= 12;
        let hour = hour24 % 12;
        if (hour === 0) hour = 12;
        return { hour, isPM };
    };

    // Convert 12-hour to 24-hour format
    const to24Hour = (hour12: number, isPM: boolean): number => {
        if (hour12 === 12) {
            return isPM ? 12 : 0;
        }
        return isPM ? hour12 + 12 : hour12;
    };

    const openAddModal = () => {
        setEditingAlarm(null);
        setSelectedHour(7);
        setSelectedMinute(0);
        setIsPM(false);
        setSelectedDays([1, 2, 3, 4, 5]);
        setAlarmLabel('Wake Up');
        setShowModal(true);
    };

    const openEditModal = (alarm: Alarm) => {
        setEditingAlarm(alarm);
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const { hour, isPM } = to12Hour(hours);
        setSelectedHour(hour);
        setSelectedMinute(minutes);
        setIsPM(isPM);
        setSelectedDays(alarm.days);
        setAlarmLabel(alarm.label);
        setShowModal(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSaveAlarm = async () => {
        const hour24 = to24Hour(selectedHour, isPM);
        const time = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

        if (editingAlarm) {
            // Update existing alarm
            await updateAlarm(editingAlarm.id, { time, days: selectedDays, label: alarmLabel });
            const updatedAlarm = { ...editingAlarm, time, days: selectedDays, label: alarmLabel };
            await cancelAlarmNotification(editingAlarm.id);
            await scheduleAlarmNotification(updatedAlarm);
        } else {
            // Add new alarm
            await addAlarm(time, selectedDays, alarmLabel);
            const newAlarms = useAlarmStore.getState().alarms;
            const newAlarm = newAlarms[newAlarms.length - 1];
            await scheduleAlarmNotification(newAlarm);
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowModal(false);
        setEditingAlarm(null);
    };

    const handleToggleAlarm = async (alarm: Alarm) => {
        await toggleAlarm(alarm.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const updatedAlarm = useAlarmStore.getState().alarms.find(a => a.id === alarm.id);
        if (updatedAlarm?.enabled) {
            await scheduleAlarmNotification(updatedAlarm);
        } else {
            await cancelAlarmNotification(alarm.id);
        }
    };

    const handleDeleteAlarm = async (alarm: Alarm) => {
        await cancelAlarmNotification(alarm.id);
        await deleteAlarm(alarm.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    const incrementHour = () => {
        setSelectedHour(prev => (prev % 12) + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const decrementHour = () => {
        setSelectedHour(prev => prev === 1 ? 12 : prev - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const incrementMinute = () => {
        setSelectedMinute(prev => (prev + 1) % 60);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const decrementMinute = () => {
        setSelectedMinute(prev => (prev + 59) % 60);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const toggleAMPM = () => {
        setIsPM(!isPM);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

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
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerIcon}>⏰</Text>
                        <Text style={styles.headerTitle}>BATTLE ALARMS</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={openAddModal}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.addButtonGradient}
                        >
                            <Text style={styles.addButtonText}>+ ADD</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Alarm List */}
                <ScrollView style={styles.alarmList} showsVerticalScrollIndicator={false}>
                    {alarms.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>😴</Text>
                            <Text style={styles.emptyText}>No alarms set</Text>
                            <Text style={styles.emptySubtext}>Add an alarm to start earning XP!</Text>
                        </View>
                    ) : (
                        alarms.map((alarm) => (
                            <View key={alarm.id} style={styles.alarmItem}>
                                <LinearGradient
                                    colors={alarm.enabled
                                        ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']
                                        : ['rgba(107, 114, 128, 0.15)', 'rgba(107, 114, 128, 0.05)']}
                                    style={styles.alarmItemGradient}
                                >
                                    <TouchableOpacity
                                        style={styles.alarmContent}
                                        onPress={() => openEditModal(alarm)}
                                        onLongPress={() => handleDeleteAlarm(alarm)}
                                    >
                                        <View>
                                            <Text style={[
                                                styles.alarmTime,
                                                !alarm.enabled && styles.alarmTimeDisabled
                                            ]}>
                                                {formatAlarmTime(alarm.time)}
                                            </Text>
                                            <Text style={styles.alarmLabel}>{alarm.label}</Text>
                                            <Text style={styles.alarmRepeat}>{getRepeatLabel(alarm.days)}</Text>
                                        </View>
                                        <View style={styles.alarmRight}>
                                            <View style={styles.xpBadge}>
                                                <Text style={styles.xpBadgeText}>+25 XP</Text>
                                            </View>
                                            <Switch
                                                value={alarm.enabled}
                                                onValueChange={() => handleToggleAlarm(alarm)}
                                                trackColor={{ false: '#374151', true: '#10B981' }}
                                                thumbColor={alarm.enabled ? '#fff' : '#9CA3AF'}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        ))
                    )}
                </ScrollView>
            </LinearGradient>

            {/* Add/Edit Alarm Modal */}
            <Modal
                visible={showModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowModal(false)}
                >
                    <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                        <LinearGradient
                            colors={['#1E1B4B', '#312E81', '#1E1B4B']}
                            style={styles.modalGradient}
                        >
                            {/* Ornate corners */}
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />

                            <Text style={styles.modalTitle}>
                                {editingAlarm ? '✏️ Edit Alarm' : '⚔️ Set Battle Alarm'}
                            </Text>

                            {/* Time Picker with AM/PM */}
                            <View style={styles.timePickerContainer}>
                                {/* Hour */}
                                <View style={styles.timeColumn}>
                                    <TouchableOpacity onPress={incrementHour} style={styles.timeButton}>
                                        <Text style={styles.timeButtonText}>▲</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timeValue}>
                                        {selectedHour.toString().padStart(2, '0')}
                                    </Text>
                                    <TouchableOpacity onPress={decrementHour} style={styles.timeButton}>
                                        <Text style={styles.timeButtonText}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.timeSeparator}>:</Text>

                                {/* Minute */}
                                <View style={styles.timeColumn}>
                                    <TouchableOpacity onPress={incrementMinute} style={styles.timeButton}>
                                        <Text style={styles.timeButtonText}>▲</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timeValue}>
                                        {selectedMinute.toString().padStart(2, '0')}
                                    </Text>
                                    <TouchableOpacity onPress={decrementMinute} style={styles.timeButton}>
                                        <Text style={styles.timeButtonText}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* AM/PM Toggle */}
                                <TouchableOpacity
                                    style={styles.ampmContainer}
                                    onPress={toggleAMPM}
                                >
                                    <View style={[styles.ampmButton, !isPM && styles.ampmButtonActive]}>
                                        <Text style={[styles.ampmText, !isPM && styles.ampmTextActive]}>AM</Text>
                                    </View>
                                    <View style={[styles.ampmButton, isPM && styles.ampmButtonActive]}>
                                        <Text style={[styles.ampmText, isPM && styles.ampmTextActive]}>PM</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Day Selector */}
                            <View style={styles.daySelector}>
                                {DAY_NAMES.map((name, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dayButton,
                                            selectedDays.includes(index) && styles.dayButtonActive
                                        ]}
                                        onPress={() => toggleDay(index)}
                                    >
                                        <Text style={[
                                            styles.dayButtonText,
                                            selectedDays.includes(index) && styles.dayButtonTextActive
                                        ]}>
                                            {name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* XP Preview */}
                            <View style={styles.xpPreview}>
                                <Text style={styles.xpPreviewLabel}>Quick dismiss reward:</Text>
                                <Text style={styles.xpPreviewValue}>+25 XP</Text>
                            </View>

                            {/* Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={handleSaveAlarm}
                                >
                                    <LinearGradient
                                        colors={['#FBBF24', '#D97706']}
                                        style={styles.confirmButtonGradient}
                                    >
                                        <Text style={styles.confirmButtonText}>
                                            {editingAlarm ? '💾 Save' : '⏰ Set Alarm'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
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
        position: 'relative',
        minHeight: 200,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    headerLeft: {
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
    addButton: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
    },
    addButtonGradient: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
    },
    addButtonText: {
        ...FONTS.caption,
        color: COLORS.text,
        fontWeight: '700',
    },
    alarmList: {
        maxHeight: 200,
    },
    alarmItem: {
        marginBottom: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    alarmItemGradient: {
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    alarmContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
    },
    alarmTime: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.text,
    },
    alarmTimeDisabled: {
        color: COLORS.textMuted,
    },
    alarmLabel: {
        ...FONTS.body,
        color: COLORS.textSecondary,
    },
    alarmRepeat: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    alarmRight: {
        alignItems: 'flex-end',
        gap: SPACING.sm,
    },
    xpBadge: {
        backgroundColor: COLORS.xpPositiveGlow,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
    },
    xpBadgeText: {
        ...FONTS.caption,
        color: COLORS.xpPositive,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        ...FONTS.subheading,
        color: COLORS.text,
    },
    emptySubtext: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
    },
    modalGradient: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 2,
        borderColor: COLORS.border,
        position: 'relative',
    },
    modalTitle: {
        ...FONTS.heading,
        color: COLORS.textGold,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    timeColumn: {
        alignItems: 'center',
    },
    timeButton: {
        padding: SPACING.sm,
    },
    timeButtonText: {
        fontSize: 24,
        color: COLORS.textMuted,
    },
    timeValue: {
        fontSize: 56,
        fontWeight: '800',
        color: COLORS.accent,
        minWidth: 80,
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 56,
        fontWeight: '800',
        color: COLORS.accent,
        marginHorizontal: SPACING.xs,
    },
    ampmContainer: {
        marginLeft: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    ampmButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    ampmButtonActive: {
        backgroundColor: COLORS.primary,
    },
    ampmText: {
        ...FONTS.body,
        color: COLORS.textMuted,
        fontWeight: '700',
    },
    ampmTextActive: {
        color: COLORS.text,
    },
    daySelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.xl,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 114, 128, 0.3)',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dayButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryLight,
    },
    dayButtonText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    dayButtonTextActive: {
        color: COLORS.text,
    },
    xpPreview: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.xpPositiveGlow,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    xpPreviewLabel: {
        ...FONTS.body,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    xpPreviewValue: {
        ...FONTS.subheading,
        color: COLORS.xpPositive,
        fontWeight: '800',
    },
    modalButtons: {
        flexDirection: 'row',
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
    confirmButton: {
        flex: 1,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    confirmButtonGradient: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.lg,
    },
    confirmButtonText: {
        ...FONTS.body,
        color: '#1F2937',
        fontWeight: '700',
    },
});
