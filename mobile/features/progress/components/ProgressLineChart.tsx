import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { COLORS } from '@/constants/colors';

interface Series {
  color: string;
  values: Array<number | null>;
}

interface Props {
  labels: string[];
  series: Series[];
  width: number;
  height?: number;
}

export default function ProgressLineChart({ labels, series, width, height = 190 }: Props) {
  const padding = { left: 12, right: 12, top: 16, bottom: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = series
    .flatMap(item => item.values)
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>Aún no hay registros en este periodo.</Text>
      </View>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const margin = Math.max((max - min) * 0.2, 2);
  const lower = min - margin;
  const range = max + margin - lower;
  const x = (index: number) =>
    padding.left +
    (labels.length === 1 ? chartWidth / 2 : (index / (labels.length - 1)) * chartWidth);
  const y = (value: number) => padding.top + chartHeight - ((value - lower) / range) * chartHeight;
  const visibleLabelIndexes = labels
    .map((_, index) => index)
    .filter(
      index => labels.length <= 8 || index === 0 || index === labels.length - 1 || index % 5 === 0
    );

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map(position => (
          <Line
            key={position}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + chartHeight * position}
            y2={padding.top + chartHeight * position}
            stroke={COLORS.border}
            strokeDasharray="4 4"
          />
        ))}
        {series.map((item, seriesIndex) => {
          const segments: Array<Array<{ x: number; y: number }>> = [];
          let current: Array<{ x: number; y: number }> = [];
          item.values.forEach((value, index) => {
            if (value === null) {
              if (current.length) segments.push(current);
              current = [];
            } else {
              current.push({ x: x(index), y: y(value) });
            }
          });
          if (current.length) segments.push(current);
          return (
            <React.Fragment key={seriesIndex}>
              {segments.map((segment, index) => (
                <React.Fragment key={index}>
                  {segment.length > 1 && (
                    <Polyline
                      points={segment.map(point => `${point.x},${point.y}`).join(' ')}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {segment.map((point, pointIndex) => (
                    <Circle
                      key={pointIndex}
                      cx={point.x}
                      cy={point.y}
                      r={4}
                      fill={COLORS.surface}
                      stroke={item.color}
                      strokeWidth={2.5}
                    />
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
      </Svg>
      {visibleLabelIndexes.map(index => (
        <Text
          key={index}
          style={[styles.label, { left: x(index) - 22, top: height - padding.bottom + 7 }]}
        >
          {labels[index]}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  label: {
    position: 'absolute',
    width: 44,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 10,
  },
});
