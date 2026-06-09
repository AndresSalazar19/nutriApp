import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressHeader from './components/ProgressHeader';
import HealthMetricsCard from './components/HealthMetricsCard'; 
import PeriodStats from './components/PeriodStats';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { COLORS } from '@/constants/colors';

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
      { label: 'Hierro', current: 15, target: 18, unit: 'mg', color: '#C84B31' },
      { label: 'Calcio', current: 850, target: 1000, unit: 'mg', color: '#4D96FF' },
      { label: 'Magnesio', current: 310, target: 400, unit: 'mg', color: '#6BCB77' },
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
      { label: 'Hierro', current: 16, target: 18, unit: 'mg', color: '#C84B31' },
      { label: 'Calcio', current: 910, target: 1000, unit: 'mg', color: '#4D96FF' },
      { label: 'Magnesio', current: 340, target: 400, unit: 'mg', color: '#6BCB77' },
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
      { label: 'Hierro', current: 14, target: 18, unit: 'mg', color: '#C84B31' },
      { label: 'Calcio', current: 790, target: 1000, unit: 'mg', color: '#4D96FF' },
      { label: 'Magnesio', current: 295, target: 400, unit: 'mg', color: '#6BCB77' },
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
      { label: 'Hierro', current: 15, target: 18, unit: 'mg', color: '#C84B31' },
      { label: 'Calcio', current: 840, target: 1000, unit: 'mg', color: '#4D96FF' },
      { label: 'Magnesio', current: 320, target: 400, unit: 'mg', color: '#6BCB77' },
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

export default function ProgressScreen({ navigation } : ProgressScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Semana');
  const data = MOCK_DATA[selectedPeriod];

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
          dateLabel={data.dateLabel}
          systolicData={data.bpSystolic}
          diastolicData={data.bpDiastolic}
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