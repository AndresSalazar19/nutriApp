import React, { useState } from 'react';
import { TimePoint } from './reportsMock';

export interface LineSeries {
  data:        TimePoint[];
  color:       string;
  label:       string;
  dashed?:     boolean;
  fillOpacity?: number; // 0–1, adds area fill under the line
}

interface LineChartProps {
  series:    LineSeries[];
  height?:   number;
  showGrid?: boolean;
  goalLine?: { value: number; color: string; label: string };
}

const PAD = { top: 20, right: 16, bottom: 28, left: 40 };

export function LineChart({ series, height = 160, showGrid = true, goalLine }: LineChartProps) {
  const [hovered, setHovered] = useState<{ x: number; y: number; values: { label: string; value: number; color: string }[] } | null>(null);

  const W = 400;
  const H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top  - PAD.bottom;

  // Flatten all values to compute scale
  const allValues = [
    ...series.flatMap(s => s.data.map(d => d.value)),
    ...(goalLine ? [goalLine.value] : []),
  ];
  if (!allValues.length) return null;

  const minVal = Math.min(...allValues) * 0.97;
  const maxVal = Math.max(...allValues) * 1.03;

  const xScale = (i: number, total: number) =>
    PAD.left + (i / Math.max(total - 1, 1)) * innerW;
  const yScale = (v: number) =>
    PAD.top + ((maxVal - v) / (maxVal - minVal)) * innerH;

  // X labels from first series
  const xLabels = series[0]?.data ?? [];

  // Grid Y ticks
  const yTicks = Array.from({ length: 4 }, (_, i) =>
    minVal + (i / 3) * (maxVal - minVal)
  );

  function buildPath(data: TimePoint[]): string {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i, data.length).toFixed(1)} ${yScale(d.value).toFixed(1)}`)
      .join(' ');
  }

  function buildArea(data: TimePoint[]): string {
    const line = buildPath(data);
    return [
      line,
      `L ${xScale(data.length - 1, data.length).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`,
      `L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)}`,
      'Z',
    ].join(' ');
  }

  // Hover detection — find closest x index
  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width) * W;
    const n    = series[0]?.data.length ?? 0;
    if (!n) return;
    const idx  = Math.round((mx - PAD.left) / innerW * (n - 1));
    const clampedIdx = Math.max(0, Math.min(n - 1, idx));
    const x    = xScale(clampedIdx, n);
    const values = series.map(s => ({
      label: s.label,
      color: s.color,
      value: s.data[clampedIdx]?.value ?? 0,
    }));
    setHovered({ x, y: 0, values });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        {series.map((s, si) => (
          <linearGradient key={si} id={`fill${si}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={s.color} stopOpacity={s.fillOpacity ?? 0.12} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>

      {/* Grid */}
      {showGrid && yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
            stroke="#f3f4f6" strokeWidth="1"
          />
          <text x={PAD.left - 4} y={yScale(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* Goal line */}
      {goalLine && (
        <>
          <line
            x1={PAD.left} y1={yScale(goalLine.value)} x2={W - PAD.right} y2={yScale(goalLine.value)}
            stroke={goalLine.color} strokeWidth="1.5" strokeDasharray="4 3"
          />
          <text x={W - PAD.right + 4} y={yScale(goalLine.value) + 4} fontSize="9" fill={goalLine.color} fontWeight="600">
            {goalLine.label}
          </text>
        </>
      )}

      {/* Area fills */}
      {series.map((s, si) =>
        (s.fillOpacity ?? 0) > 0 ? (
          <path key={`area${si}`} d={buildArea(s.data)} fill={`url(#fill${si})`} />
        ) : null
      )}

      {/* Lines */}
      {series.map((s, si) => (
        <path
          key={`line${si}`}
          d={buildPath(s.data)}
          fill="none"
          stroke={s.color}
          strokeWidth="2.5"
          strokeDasharray={s.dashed ? '5 3' : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* Dots — only last point */}
      {series.map((s, si) => {
        const last = s.data[s.data.length - 1];
        const i    = s.data.length - 1;
        if (!last) return null;
        return (
          <circle
            key={`dot${si}`}
            cx={xScale(i, s.data.length)} cy={yScale(last.value)} r="4"
            fill="#fff" stroke={s.color} strokeWidth="2.5"
          />
        );
      })}

      {/* Hover vertical line */}
      {hovered && (
        <line
          x1={hovered.x} y1={PAD.top} x2={hovered.x} y2={PAD.top + innerH}
          stroke="#d1d5db" strokeWidth="1" strokeDasharray="3 2"
        />
      )}

      {/* X axis labels */}
      {xLabels.filter((_, i) => i === 0 || i === xLabels.length - 1 || i === Math.floor(xLabels.length / 2)).map((d, _, arr) => {
        const origIdx = xLabels.indexOf(d);
        return (
          <text
            key={origIdx}
            x={xScale(origIdx, xLabels.length)}
            y={H - 4}
            textAnchor="middle" fontSize="9" fill="#9ca3af"
          >
            {d.date}
          </text>
        );
      })}
    </svg>
  );
}
