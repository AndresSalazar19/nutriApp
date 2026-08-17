import React from 'react';
import { WeightEntry } from '../mock/patientsMock';

interface WeightChartProps {
  data: WeightEntry[];
  goal: number;
}

export function WeightChart({ data, goal }: WeightChartProps) {
  const W = 380;
  const H = 120;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

  if (!data.length) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, goal) - 1;
  const maxVal = Math.max(...values, goal) + 1;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xScale = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + ((maxVal - v) / (maxVal - minVal)) * innerH;

  // Build SVG path
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(d.value).toFixed(1)}`)
    .join(' ');

  // Area fill path
  const areaPath = [
    linePath,
    `L ${xScale(data.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`,
    `L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`,
    'Z',
  ].join(' ');

  const goalY = yScale(goal);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Goal line */}
      <line
        x1={PAD.left}
        y1={goalY}
        x2={W - PAD.right}
        y2={goalY}
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text x={W - PAD.right + 4} y={goalY + 4} fontSize="9" fill="#f59e0b" fontWeight="600">
        Meta: {goal} kg
      </text>

      {/* Area */}
      <path d={areaPath} fill="url(#wg)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Points */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(i)}
          cy={yScale(d.value)}
          r="3.5"
          fill="#fff"
          stroke="#22c55e"
          strokeWidth="2"
        />
      ))}

      {/* Last value label */}
      <text
        x={xScale(data.length - 1)}
        y={yScale(data[data.length - 1].value) - 8}
        textAnchor="middle"
        fontSize="10"
        fill="#16a34a"
        fontWeight="700"
      >
        {data[data.length - 1].value}
      </text>

      {/* X axis labels */}
      {data
        .filter((_, i) => i === 0 || i === data.length - 1)
        .map((d, idx) => {
          const i = idx === 0 ? 0 : data.length - 1;
          return (
            <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {d.date}
            </text>
          );
        })}

      {/* Y axis ticks */}
      {[minVal + 1, goal, maxVal - 1].map((v) => (
        <text
          key={v}
          x={PAD.left - 4}
          y={yScale(v) + 4}
          textAnchor="end"
          fontSize="9"
          fill="#9ca3af"
        >
          {v.toFixed(0)}
        </text>
      ))}
    </svg>
  );
}
