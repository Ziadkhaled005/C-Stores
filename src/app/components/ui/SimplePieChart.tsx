interface Slice {
  name: string;
  value: number;
}

const COLORS = ['#7C3AED', '#06B6D4', '#EC4899', '#F97316', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

interface SimplePieChartProps {
  data: Slice[];
  valueFormatter?: (v: number) => string;
}

export function SimplePieChart({ data, valueFormatter = String }: SimplePieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0 || data.length === 0) {
    return <div className="flex items-center justify-center h-32 text-gray-300 text-sm">لا توجد بيانات</div>;
  }

  let cumulativePct = 0;
  const slices = data.map((d, i) => {
    const pct = (d.value / total) * 100;
    const start = cumulativePct;
    cumulativePct += pct;
    return { ...d, pct, start, color: COLORS[i % COLORS.length] };
  });

  const gradient = slices
    .map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(', ');

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-32 h-32 rounded-full flex-shrink-0"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="w-full space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-600 truncate">{s.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mr-2">
              <span className="font-semibold text-gray-700">{valueFormatter(s.value)}</span>
              <span className="text-gray-400">({s.pct.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
