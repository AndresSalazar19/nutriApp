import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { COLORS } from '@/constants/colors';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { AuthService } from '@/features/auth/services/authService';
import ProgressHeader from './components/ProgressHeader';
import ProgressLineChart from './components/ProgressLineChart';
import { ProgressData, ProgressPeriod, ProgressService } from './services/progressService';

type DisplayPeriod = 'Día' | 'Semana' | 'Mes';

const API_PERIOD: Record<DisplayPeriod, ProgressPeriod> = {
  Día: 'day',
  Semana: 'week',
  Mes: 'month',
};

const CHART_WIDTH = Dimensions.get('window').width - Spacing.md * 4;

function SummaryCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryLabelRow}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summarySubtitle}>{subtitle}</Text>
    </View>
  );
}

function ChartCard({
  title,
  subtitle,
  labels,
  series,
  legend,
}: {
  title: string;
  subtitle: string;
  labels: string[];
  series: Array<{ color: string; values: Array<number | null> }>;
  legend: Array<{ label: string; color: string }>;
}) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Text style={styles.chartSubtitle}>{subtitle}</Text>
      <ProgressLineChart labels={labels} series={series} width={CHART_WIDTH} />
      <View style={styles.legend}>
        {legend.map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function weightSummary(data: ProgressData | null) {
  if (!data?.weight.current_kg) return { label: 'Cambio de peso', value: '--', subtitle: 'Sin registros' };
  const change = data.weight.change_kg;
  if (change === null) {
    return {
      label: 'Peso actual',
      value: `${data.weight.current_kg.toFixed(1)} kg`,
      subtitle: 'Se necesita otra medición para comparar',
    };
  }
  const direction = change < 0 ? 'Perdida de peso' : change > 0 ? 'Aumento de peso' : 'Peso estable';
  const sign = change > 0 ? '+' : '';
  return {
    label: direction,
    value: `${sign}${change.toFixed(1)} kg`,
    subtitle: `${sign}${data.weight.change_percent?.toFixed(1) ?? '0.0'}% en el periodo`,
  };
}

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<DisplayPeriod>('Semana');
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const user = await AuthService.getUser();
      if (!user?.id) throw new Error('Inicia sesion para consultar tu progreso.');
      setData(await ProgressService.getProgress(user.id, API_PERIOD[selectedPeriod]));
    } catch (requestError) {
      setData(null);
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el progreso.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const weight = weightSummary(data);
  const pressureValue = data?.pressure.systolic
    ? `${data.pressure.systolic}/${data.pressure.diastolic}`
    : '--/--';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Estilo de la barra de estado adaptado al header verde */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ProgressHeader selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.centerText}>Cargando progreso...</Text>
        </View>
      ) : error ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={36} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.centerText}>Desliza hacia abajo para reintentar.</Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
        >
          <View style={styles.summaryGrid}>
            <SummaryCard icon="scale-bathroom" {...weight} />
            <SummaryCard
              icon="heart-pulse"
      label="Presión arterial actual"
              value={pressureValue}
              subtitle={data?.pressure.category ?? 'Sin registros'}
            />
          </View>

          <ChartCard
            title="Evolución del peso"
            subtitle="Registros de peso en el periodo seleccionado"
            labels={data?.weight_series.map(point => point.label) ?? []}
            series={[
              {
                color: COLORS.primary,
                values: data?.weight_series.map(point => point.value) ?? [],
              },
            ]}
            legend={[{ label: 'Peso (kg)', color: COLORS.primary }]}
          />

          <ChartCard
            title="Evolución de presión arterial"
            subtitle="Sistólica y diastólica (mmHg)"
            labels={data?.pressure_series.map(point => point.label) ?? []}
            series={[
              {
                color: COLORS.danger,
                values: data?.pressure_series.map(point => point.systolic) ?? [],
              },
              {
                color: COLORS.chartOrange,
                values: data?.pressure_series.map(point => point.diastolic) ?? [],
              },
            ]}
            legend={[
              { label: 'Sistólica', color: COLORS.danger },
              { label: 'Diastólica', color: COLORS.chartOrange },
            ]}
          />
        </ScrollView>
      )}
      <BottomTabBar activeTab="progreso" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.md, paddingBottom: 100 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  centerText: { marginTop: 10, color: COLORS.textMuted, textAlign: 'center' },
  errorText: { marginTop: 10, color: COLORS.danger, fontWeight: '600', textAlign: 'center' },
  summaryGrid: { gap: 12, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 13 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 30, fontWeight: '800', marginTop: 10 },
  summarySubtitle: { color: COLORS.success, fontSize: 12, marginTop: 4 },
  chartCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },
  chartTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  chartSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 3, marginBottom: 8 },
  legend: { flexDirection: 'row', gap: 18, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine: { width: 16, height: 3, borderRadius: 2 },
  legendText: { color: COLORS.textSecondary, fontSize: 12 },
});
