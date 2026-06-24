import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import BloodPressureChart from './BloodPressureChart';
import NutrientProgressBar from './NutrientProgressBar';
import MetricToggle from './MetricToggle';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.md * 4;

type Period = 'Semana' | 'Mes' | 'Año' | 'Todo';
type MetricType = 'Presión' | 'Micronutrientes';

const NUTRIENT_SUBTITLE_BY_PERIOD: Record<Period, string> = {
  Semana: 'Promedio de consumo semanal vs meta',
  Mes: 'Consumo total mensual vs meta',
  Año: 'Consumo acumulado anual vs meta',
  Todo: 'Historial de consumo total vs meta',
};

const PRESSURE_SUBTITLE_BY_PERIOD: Record<Period, string> = {
  Semana: 'Última toma (Tendencia semanal)',
  Mes: 'Promedio mensual',
  Año: 'Promedio anual',
  Todo: 'Historial general',
};

// 1. DICCIONARIO DINÁMICO PARA LAS ETIQUETAS DEL EJE X
const LABELS_BY_PERIOD: Record<Period, string[]> = {
  Semana: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  Mes: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
  Año: ['Ene', 'Abr', 'Jul', 'Oct', 'Dic'], // Puntos clave del año para no saturar la pantalla
  Todo: ['2024', '2025', '2026'], // O los años correspondientes a tu historial
};

interface HealthMetricsCardProps {
  period: Period; 
  dateLabel?: string;
  systolicData?: number[];
  diastolicData?: number[];
  nutrients?: Array<{ label: string; current: number; target: number; unit: string; color: string }>;
}

export default function HealthMetricsCard({
  period, 
  dateLabel = '23 - 29 de Octubre, 2025',
  systolicData = [120, 122, 119, 125, 121, 118, 120],
  diastolicData = [80, 81, 79, 84, 80, 78, 79],
  nutrients = []
}: HealthMetricsCardProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('Presión');
  const currentSys = systolicData[systolicData.length - 1];
  const currentDia = diastolicData[diastolicData.length - 1];

  const currentLabels = LABELS_BY_PERIOD[period];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.sectionTitle}>Salud y Métricas</Text>
        </View>
        <MetricToggle
          options={['Presión', 'Micronutrientes']}
          activeOption={activeMetric}
          onSelect={setActiveMetric}
        />
      </View>

      {activeMetric === 'Presión' ? (
        <View style={styles.contentContainer}>
          <View style={styles.valueRow}>
            <View>
              <Text style={styles.metricSubLabel}>{PRESSURE_SUBTITLE_BY_PERIOD[period]}</Text>
              <View style={styles.pressureValues}>
                <Text style={styles.pressureValue}>{currentSys}/{currentDia}</Text>
                <Text style={styles.pressureUnit}>mmHg</Text>
              </View>
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.danger || '#FF5252' }]} />
                <Text style={styles.legendText}>Sístole</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4A90D9' }]} />
                <Text style={styles.legendText}>Diástole</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <BloodPressureChart 
              systolicData={systolicData} 
              diastolicData={diastolicData} 
              labels={currentLabels} 
              width={CHART_WIDTH} 
            />
          </View>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.metricSubLabel}>{NUTRIENT_SUBTITLE_BY_PERIOD[period]}</Text>
          <View style={styles.nutrientsList}>
            {nutrients.map((item, index) => (
              <NutrientProgressBar key={index} {...item}/>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    marginHorizontal: Spacing.md, 
    marginVertical: Spacing.sm, 
    backgroundColor: COLORS.surface, 
    borderRadius: Radius.lg, 
    padding: Spacing.md, 
    ...Shadows.md 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.md, 
    flexWrap: 'wrap', 
    gap: 8 
  },
  dateLabel: { 
    ...Typography.label, 
    color: COLORS.textMuted, 
    textTransform: 'uppercase', 
    marginBottom: 2 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textPrimary 
  },
  contentContainer: { 
    marginTop: Spacing.xs 
  },
  metricSubLabel: { 
    ...Typography.bodySmall, 
    color: COLORS.textMuted, 
    marginBottom: Spacing.xs 
  },
  valueRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginBottom: Spacing.sm 
  },
  pressureValues: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: 4 
  },
  pressureValue: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: COLORS.textPrimary, 
    lineHeight: 36 
  },
  pressureUnit: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    marginBottom: 4 
  },
  legendContainer: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 6 
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  legendDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4 
  },
  legendText: { 
    fontSize: 12, 
    color: COLORS.textSecondary 
  },
  chartContainer: { 
    marginTop: Spacing.xs 
  },
  nutrientsList: { 
    gap: Spacing.sm, 
    marginTop: Spacing.xs 
  },
});