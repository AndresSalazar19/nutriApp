import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import ProgressHeader from './components/ProgressHeader';
import HealthMetricsCard from './components/HealthMetricsCard'; 
import PeriodStats from './components/PeriodStats';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { COLORS } from '@/constants/colors';
import { AuthService } from '@/features/auth/services/authService';
import { BloodPressureLog, ProgressService } from './services/progressService';

interface ProgressScreenProps {
  navigation?: any;
}

// --- Mock data actualizado con soporte para gráficos de doble línea y micronutrientes ---
const MOCK_DATA = {
  Semana: {
    dateLabel: '23 - 29 de Octubre, 2025',
    // Datos de presión histórica (Sístole y Diástole) para la semana
    bpSystolic: [120, 122, 119, 125, 121, 118, 120],
    bpDiastolic: [80, 81, 79, 84, 80, 78, 79],
    // Micronutrientes correspondientes al periodo semanal
    nutrients: [
      { label: 'Hierro', current: 15, target: 18, unit: 'mg', color: COLORS.primary },
      { label: 'Calcio', current: 850, target: 1000, unit: 'mg', color: COLORS.primaryMedium },
      { label: 'Magnesio', current: 310, target: 400, unit: 'mg', color: COLORS.primaryAccent },
    ],
    stats: {
      hydration: { value: '8.5', unit: 'L', subtitle: 'Promedio: 1.2L/día' },
      calories: { value: '10,500', subtitle: 'Promedio: 1,500/día' },
      activity: { value: '5', unit: 'días', subtitle: 'Meta: 30 min/día' },
      adherence: { value: '86', subtitle: '¡Muy bien!' },
    },
  },
  Mes: {
    dateLabel: 'Octubre 2025',
    bpSystolic: [118, 120, 121, 119, 122, 120, 118],
    bpDiastolic: [78, 79, 80, 77, 81, 79, 78],
    nutrients: [
      { label: 'Hierro', current: 16, target: 18, unit: 'mg', color: COLORS.primary },
      { label: 'Calcio', current: 910, target: 1000, unit: 'mg', color: COLORS.primaryMedium },
      { label: 'Magnesio', current: 340, target: 400, unit: 'mg', color: COLORS.primaryAccent },
    ],
    stats: {
      hydration: { value: '38', unit: 'L', subtitle: 'Promedio: 1.3L/día' },
      calories: { value: '46,200', subtitle: 'Promedio: 1,540/día' },
      activity: { value: '22', unit: 'días', subtitle: 'Meta: 30 min/día' },
      adherence: { value: '88', subtitle: '¡Excelente!' },
    },
  },
  Año: {
    dateLabel: '2025',
    bpSystolic: [122, 124, 121, 123, 120, 119, 122],
    bpDiastolic: [81, 82, 80, 83, 79, 78, 81],
    nutrients: [
      { label: 'Hierro', current: 14, target: 18, unit: 'mg', color: COLORS.primary },
      { label: 'Calcio', current: 790, target: 1000, unit: 'mg', color: COLORS.primaryMedium },
      { label: 'Magnesio', current: 295, target: 400, unit: 'mg', color: COLORS.primaryAccent },
    ],
    stats: {
      hydration: { value: '456', unit: 'L', subtitle: 'Promedio: 1.3L/día' },
      calories: { value: '554k', subtitle: 'Promedio: 1,520/día' },
      activity: { value: '248', unit: 'días', subtitle: 'Meta: 30 min/día' },
      adherence: { value: '82', subtitle: '¡Muy bien!' },
    },
  },
  Todo: {
    dateLabel: 'Todo el tiempo',
    bpSystolic: [120, 121, 119, 122, 120, 121, 120],
    bpDiastolic: [79, 80, 78, 81, 79, 80, 79],
    nutrients: [
      { label: 'Hierro', current: 15, target: 18, unit: 'mg', color: COLORS.primary },
      { label: 'Calcio', current: 840, target: 1000, unit: 'mg', color: COLORS.primaryMedium },
      { label: 'Magnesio', current: 320, target: 400, unit: 'mg', color: COLORS.primaryAccent },
    ],
    stats: {
      hydration: { value: '912', unit: 'L', subtitle: 'Promedio: 1.3L/día' },
      calories: { value: '1.1M', subtitle: 'Promedio: 1,510/día' },
      activity: { value: '496', unit: 'días', subtitle: 'Meta: 30 min/día' },
      adherence: { value: '80', subtitle: '¡Bien!' },
    },
  },
};

type Period = 'Semana' | 'Mes' | 'Año' | 'Todo';

const LIMIT_BY_PERIOD: Record<Period, number> = {
  Semana: 7,
  Mes: 4,
  Año: 5,
  Todo: 7,
};

function sortPressureHistory(history: BloodPressureLog[]) {
  return [...history].sort((a, b) => {
    const aTime = a.measured_at ?? a.created_at ?? a.log_date;
    const bTime = b.measured_at ?? b.created_at ?? b.log_date;
    return aTime.localeCompare(bTime);
  });
}

function pressureSeries(
  history: BloodPressureLog[],
  period: Period,
  fallbackSys: number[],
  fallbackDia: number[]
) {
  const selected = sortPressureHistory(history).slice(-LIMIT_BY_PERIOD[period]);

  if (selected.length === 0) {
    return { systolic: fallbackSys, diastolic: fallbackDia };
  }

  const systolic = selected.map(item => item.systolic);
  const diastolic = selected.map(item => item.diastolic);

  if (selected.length === 1) {
    return {
      systolic: [systolic[0], systolic[0]],
      diastolic: [diastolic[0], diastolic[0]],
    };
  }

  return { systolic, diastolic };
}

function latestDateLabel(history: BloodPressureLog[], fallback: string) {
  const latest = sortPressureHistory(history).at(-1);
  if (!latest) return fallback;
  return `Ultimo registro: ${latest.log_date}`;
}

export default function ProgressScreen({ navigation } : ProgressScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Semana');
  const [pressureHistory, setPressureHistory] = useState<BloodPressureLog[]>([]);
  const data = MOCK_DATA[selectedPeriod];
  const pressureData = useMemo(
    () => pressureSeries(pressureHistory, selectedPeriod, data.bpSystolic, data.bpDiastolic),
    [pressureHistory, selectedPeriod, data.bpSystolic, data.bpDiastolic]
  );

  useFocusEffect(
    useCallback(() => {
      async function loadPressureHistory() {
      const user = await AuthService.getUser();
      if (!user?.id) return;
      const history = await ProgressService.getBloodPressureHistory(user.id, 100).catch(() => []);
      setPressureHistory(history);
    }

    void loadPressureHistory();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Estilo de la barra de estado adaptado al header verde */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ProgressHeader 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={setSelectedPeriod} 
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HealthMetricsCard
          period={selectedPeriod}
          dateLabel={latestDateLabel(pressureHistory, data.dateLabel)}
          systolicData={pressureData.systolic}
          diastolicData={pressureData.diastolic}
          nutrients={data.nutrients}
        />

        <PeriodStats
          period={selectedPeriod}
          hydration={data.stats.hydration}
          calories={data.stats.calories}
          activity={data.stats.activity}
          adherence={data.stats.adherence}
        />
      </ScrollView>

      <BottomTabBar activeTab="progreso"/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
});
