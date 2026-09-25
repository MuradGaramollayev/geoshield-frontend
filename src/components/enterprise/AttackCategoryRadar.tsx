import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { fetchTimeline, radarFromDaily } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { useTheme } from "../../design/themeContext";
import { ChartTooltip } from "../../design/ChartTooltip";
import { Card, CardHeader, ErrorState, SkeletonCard } from "../ui";

export default function AttackCategoryRadar() {
  const th = useTheme();
  const { data, error, loading, reload } = useAsync(() => fetchTimeline(21), []);
  if (loading) return <SkeletonCard tall />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const rows = radarFromDaily(data!.daily);

  return (
    <Card>
      <CardHeader title="This week against last" description="Event categories, 7-day windows ending on the dataset date" />
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={rows} outerRadius="72%">
          <PolarGrid stroke="rgba(22,22,22,0.1)" />
          <PolarAngleAxis dataKey="category" tick={{ ...th.chart.axisTick, fontSize: 12, fill: th.c.text2 }} />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Radar name="Last week" dataKey="lastWeek" stroke={th.c.text3} fill={th.c.text3} fillOpacity={0.12} strokeDasharray="4 4" />
          <Radar name="This week" dataKey="thisWeek" stroke={th.c.accent} fill={th.c.accent} fillOpacity={0.25} strokeWidth={2} />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 text-sm text-text-2">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-[4px] bg-accent" /> This week</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-[4px] border-2 border-dashed border-text-3" /> Last week</span>
      </div>
    </Card>
  );
}
