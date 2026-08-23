const ICON_CHIP_COLORS = {
  blue: 'bg-[#EFF6FF] text-[#2563EB]',
  green: 'bg-[#DCFCE7] text-[#16A34A]',
  amber: 'bg-[#FEF3C7] text-[#D97706]',
  sky: 'bg-[#E0F2FE] text-[#0284C7]',
};

const TREND_COLORS = {
  up: 'bg-[#DCFCE7] text-[#16A34A]',
  down: 'bg-[#FEE2E2] text-[#DC2626]',
  neutral: 'bg-slate-100 text-slate-500',
};

/**
 * Reusable statistic card for dashboard-style metrics.
 *
 * @param {Object} props
 * @param {React.ElementType} [props.icon] - Icon component (e.g. from lucide-react)
 * @param {string} props.label - Metric label, e.g. "Total applications"
 * @param {string|number} props.value - The metric value to display
 * @param {'up'|'down'|'neutral'} [props.trend] - Trend direction, controls pill color
 * @param {string} [props.trendLabel] - Trend text, e.g. "+12.4%"
 * @param {'blue'|'green'|'amber'|'sky'} [props.color] - Icon chip color
 * @param {boolean} [props.loading] - Shows skeleton state when true
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = 'blue',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs animate-pulse">
        <div className="h-10 w-10 rounded-[10px] bg-slate-200 mb-7" />
        <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-6 w-16 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] mb-7 ${ICON_CHIP_COLORS[color]}`}
      >
        {Icon && <Icon className="h-[18px] w-[18px]" />}
      </div>
      <p className="text-[13px] text-[#475569]">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-[26px] font-bold text-[#0F172A]">{value}</span>
        {trendLabel && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TREND_COLORS[trend]}`}
          >
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
