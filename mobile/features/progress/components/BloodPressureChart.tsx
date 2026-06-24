import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { COLORS } from '@/constants/colors';

interface PressureChartProps {
  systolicData: number[];
  diastolicData: number[];
  labels: string[]; // ['L', 'M', 'M', 'J', 'V', 'S', 'D'] o el período que elijas
  width: number;
  height?: number;
}

export default function BloodPressureChart({
  systolicData,
  diastolicData,
  labels,
  width,
  height = 180, // Incrementamos un poco el alto por defecto para dar aire a las etiquetas
}: PressureChartProps) {
  if (systolicData.length < 2 || diastolicData.length < 2) return null;

  // Configuración de márgenes para que quepan los textos
  const paddingLeft = 30;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25; // Espacio para las etiquetas del eje X

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Forzamos un rango fijo o dinámico pero con límites lógicos de presión
  const allValues = [...systolicData, ...diastolicData];
  const minVal = Math.max(0, Math.min(...allValues) - 15);
  const maxVal = Math.max(...allValues) + 15;
  const range = maxVal - minVal || 1;

  // Función para calcular coordenadas (X, Y) exactas dentro del área interna del gráfico
  const getCoordinates = (data: number[]) => {
    return data.map((val, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
      return { x, y };
    });
  };

  const sysPoints = getCoordinates(systolicData);
  const diaPoints = getCoordinates(diastolicData);

  // Convertir puntos a string para el componente Polyline
  const sysPointsStr = sysPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const diaPointsStr = diaPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Líneas de referencia horizontales (Grid) en el fondo
  const gridLinesCount = 3;
  const gridValues = Array.from({ length: gridLinesCount }, (_, i) => {
    return minVal + (range / (gridLinesCount - 1)) * i;
  });

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* 1. LÍNEAS DE FONDO (GRID) Y VALORES DEL EJE Y */}
        {gridValues.map((val, i) => {
          const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
          return (
            <React.Fragment key={`grid-${i}`}>
              {/* Línea horizontal tenue */}
              <Line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4, 4"
              />
            </React.Fragment>
          );
        })}

        {/* 2. LÍNEAS DE LOS DATOS */}
        {/* Línea de Sistólica */}
        <Polyline
          points={sysPointsStr}
          fill="none"
          stroke={COLORS.danger || '#FF5252'}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Línea de Diastólica */}
        <Polyline
          points={diaPointsStr}
          fill="none"
          stroke="#4A90D9"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* 3. PUNTOS FINALES (DESTACADOS) */}
        {sysPoints.length > 0 && (
          <Circle
            cx={sysPoints[sysPoints.length - 1].x}
            cy={sysPoints[sysPoints.length - 1].y}
            r={4.5}
            fill={COLORS.surface || '#FFF'}
            stroke={COLORS.danger || '#FF5252'}
            strokeWidth="3"
          />
        )}
        {diaPoints.length > 0 && (
          <Circle
            cx={diaPoints[diaPoints.length - 1].x}
            cy={diaPoints[diaPoints.length - 1].y}
            r={4.5}
            fill={COLORS.surface || '#FFF'}
            stroke="#4A90D9"
            strokeWidth="3"
          />
        )}
      </Svg>

      {/* 4. EJE X DINÁMICO (ETIQUETAS DEL PERÍODO) */}
      {/* Usamos una capa absoluta nativa de React Native abajo para manejar las fuentes de forma más limpia */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: paddingLeft,
          right: paddingRight,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: paddingBottom,
        }}
      >
        {labels.map((label, index) => (
          <Text
            key={`label-${index}`}
            style={{
              fontSize: 11,
              color: '#94A3B8',
              fontWeight: '600',
              textAlign: 'center',
              width: chartWidth / labels.length,
            }}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}
