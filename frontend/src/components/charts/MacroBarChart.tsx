import React from 'react';
import { MacroData } from './reportsMock';

interface MacroBarChartProps {
  data:    MacroData[];
  height?: number;
}

export function MacroBarChart({ data, height = 180 }: MacroBarChartProps) {
  const W          = 340;
  const H          = height;
  const PAD        = { top: 20, right: 10, bottom: 36, left: 32 };
  const innerW     = W - PAD.left - PAD.right;
  const innerH     = H - PAD.top  - PAD.bottom;

  const allVals    = data.flatMap(d => [d.consumed, d.goal]);
  const maxVal     = Math.max(...allVals) * 1.1;

  const groupW     = innerW / data.length;
  const barW       = groupW * 0.32;
  const barGap     = groupW * 0.06;

  const yScale = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;
  const barH   = (v: number) => (v / maxVal) * innerH;

  // Y ticks
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map(Math.round);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>

      {/* Grid lines */}
      {yTicks.map(v => (
        <g key={v}>
          <line
            x1={PAD.left} y1={yScale(v)}
            x2={W - PAD.right} y2={yScale(v)}
            stroke="#f3f4f6" strokeWidth="1"
          />
          <text x={PAD.left - 4} y={yScale(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
            {v}
          </text>
        </g>
      ))}

      {data.map((d, gi) => {
        const cx = PAD.left + gi * groupW + groupW / 2;
        const x1 = cx - barW - barGap / 2;   // consumed bar
        const x2 = cx + barGap / 2;           // goal bar

        return (
          <g key={gi}>
            {/* Consumed bar */}
            <rect
              x={x1} y={yScale(d.consumed)}
              width={barW} height={barH(d.consumed)}
              fill={d.color} rx="3"
            />
            {/* Consumed value label */}
            <text x={x1 + barW / 2} y={yScale(d.consumed) - 4}
              textAnchor="middle" fontSize="9" fill={d.color} fontWeight="700">
              {d.consumed}g
            </text>

            {/* Goal bar */}
            <rect
              x={x2} y={yScale(d.goal)}
              width={barW} height={barH(d.goal)}
              fill={d.goalColor} rx="3"
            />
            {/* Goal value label */}
            <text x={x2 + barW / 2} y={yScale(d.goal) - 4}
              textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600">
              {d.goal}g
            </text>

            {/* X label */}
            <text x={cx} y={H - 4}
              textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
              {d.name}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g>
        <rect x={PAD.left} y={H - 16} width="8" height="8" fill="#6b7280" rx="2" />
        <text x={PAD.left + 11} y={H - 9} fontSize="9" fill="#6b7280">Consumido</text>
        <rect x={PAD.left + 68} y={H - 16} width="8" height="8" fill="#d1d5db" rx="2" />
        <text x={PAD.left + 80} y={H - 9} fontSize="9" fill="#9ca3af">Meta</text>
      </g>
    </svg>
  );
}
