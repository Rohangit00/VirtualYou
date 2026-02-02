import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Text,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from './src/store/gameStore';
import { useAlarmStore } from './src/store/alarmStore';
import { COLORS, SPACING, FONTS } from './src/constants/theme';
import { AvatarDisplay } from './src/components/Avatar/AvatarDisplay';
import { XPProgress } from './src/components/Dashboard/XPProgress';
import { StreakCounter } from './src/components/Dashboard/StreakCounter';
import { WeeklyChart } from './src/components/Dashboard/WeeklyChart';
import { QuickActions } from './src/components/ActivityLog/QuickActions';
import { DailySummary } from './src/components/ActivityLog/DailySummary';
import { AlarmList } from './src/components/Alarm/AlarmList';
import { AlarmRingScreen } from './src/components/Alarm/AlarmRingScreen';
import { ActivityType } from './src/utils/xpCalculator';
import { Alarm } from './src/utils/alarmTypes';
import {
  requestNotificationPermissions,
  setupNotificationReceivedListener,
  setupNotificationResponseListener,
} from './src/utils/alarmNotifications';

export default function App() {
  const {
    totalXP,
    todayXP,
    currentLevel,
    avatarState,
    streakDays,
    addActivity,
    loadState,
    getTodayActivities,
    getWeeklyXP,
  } = useGameStore();

  const { alarms, loadAlarms } = useAlarmStore();

  // Alarm ring state
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const [alarmStartTime, setAlarmStartTime] = useState<number>(0);

  useEffect(() => {
    loadState();
    loadAlarms();
    requestNotificationPermissions();

    // Setup notification listeners
    const unsubscribeReceived = setupNotificationReceivedListener((alarmId) => {
      const alarm = useAlarmStore.getState().alarms.find(a => a.id === alarmId);
      if (alarm) {
        setRingingAlarm(alarm);
        setAlarmStartTime(Date.now());
      }
    });

    const unsubscribeResponse = setupNotificationResponseListener((alarmId) => {
      const alarm = useAlarmStore.getState().alarms.find(a => a.id === alarmId);
      if (alarm) {
        setRingingAlarm(alarm);
        setAlarmStartTime(Date.now());
      }
    });

    return () => {
      unsubscribeReceived();
      unsubscribeResponse();
    };
  }, []);

  const handleAddActivity = (type: ActivityType, value: number) => {
    addActivity(type, value);
  };

  const handleAlarmDismiss = () => {
    setRingingAlarm(null);
    setAlarmStartTime(0);
  };

  const todayActivities = getTodayActivities();
  const weeklyData = getWeeklyXP();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Alarm Ring Modal */}
      <Modal
        visible={ringingAlarm !== null}
        animationType="fade"
        statusBarTranslucent
      >
        {ringingAlarm && (
          <AlarmRingScreen
            alarm={ringingAlarm}
            onDismiss={handleAlarmDismiss}
            startTime={alarmStartTime}
          />
        )}
      </Modal>

      {/* Premium Header */}
      <LinearGradient
        colors={['rgba(30, 27, 75, 0.95)', 'rgba(20, 18, 35, 0.9)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚔️</Text>
            <View style={styles.logoText}>
              <Text style={styles.headerTitle}>VIRTUALYOU</Text>
              <Text style={styles.headerSubtitle}>LEVEL UP YOUR LIFE</Text>
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{totalXP}</Text>
              <Text style={styles.quickStatLabel}>XP</Text>
            </View>
          </View>
        </View>

        {/* Decorative line */}
        <LinearGradient
          colors={['transparent', COLORS.accent, 'transparent']}
          style={styles.headerLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <AvatarDisplay
          state={avatarState}
          level={currentLevel}
        />

        {/* XP Progress */}
        <XPProgress
          totalXP={totalXP}
          todayXP={todayXP}
        />

        {/* Alarm Section - NEW! */}
        <AlarmList />

        {/* Quick Actions */}
        <QuickActions onAddActivity={handleAddActivity} />

        {/* Daily Summary */}
        <DailySummary activities={todayActivities} />

        {/* Streak */}
        <StreakCounter streakDays={streakDays} />

        {/* Weekly Chart */}
        <WeeklyChart data={weeklyData} />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  logoText: {
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.heading,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickStatItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  quickStatValue: {
    ...FONTS.subheading,
    color: COLORS.accent,
    fontWeight: '800',
  },
  quickStatLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  headerLine: {
    height: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
