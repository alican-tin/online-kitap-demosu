import type { RevenueMonth } from '../lib/api';

const formatAmount = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value / 100);

export function RevenueChart({ months }: { months: RevenueMonth[] }) {
  const maxAmount = Math.max(...months.map((month) => month.amount), 1);
  const width = 360;
  const height = 160;
  const paddingX = 18;
  const paddingY = 16;
  const step = months.length > 1 ? (width - paddingX * 2) / (months.length - 1) : 0;

  const points = months.map((month, index) => {
    const x = paddingX + step * index;
    const y =
      height -
      paddingY -
      (month.amount / maxAmount) * (height - paddingY * 2);

    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${paddingX + step * (months.length - 1)} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Aylik ciro">
        <defs>
          <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b4562e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b4562e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="line-area" d={areaPath} fill="url(#revenue-gradient)" />
        <path className="line-path" d={linePath} />
        {points.map((point, index) => (
          <circle
            key={`${point.x}-${index}`}
            cx={point.x}
            cy={point.y}
            r={3.5}
            className="line-point"
          />
        ))}
      </svg>
      <div className="line-chart-labels">
        {months.map((month) => (
          <div
            key={`${month.year}-${month.month}`}
            className="line-chart-label"
            title={formatAmount(month.amount)}
          >
            <span>{month.label}</span>
            <small>{formatAmount(month.amount)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
