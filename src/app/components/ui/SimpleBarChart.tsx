import { useState } from 'react';

interface Bar {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: Bar[];
  color?: string;
  height?: number;
  valueFormatter?: (v: number) => string;
}

export function SimpleBarChart({
  data,
  color = '#7C3AED',
  height = 180,
  valueFormatter = String,
}: SimpleBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ height }} className="flex items-end gap-1.5 w-full relative">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isHovered = hovered === i;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 relative group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                {valueFormatter(d.value)}
              </div>
            )}
            {/* Bar */}
            <div className="w-full flex flex-col justify-end" style={{ height: `calc(100% - 20px)` }}>
              <div
                className="w-full rounded-t-md transition-all duration-200"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                  opacity: hovered === null || isHovered ? 1 : 0.55,
                }}
              />
            </div>
            {/* Label */}
            <div className="text-xs text-gray-400 truncate w-full text-center leading-none">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
