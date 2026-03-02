import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
}

interface TradingChartProps {
  weeklyData: DataPoint[];
  monthlyData: DataPoint[];
  label: string;
  unit?: string;
  color: string;
  gradientId: string;
  domain?: [number | string, number | string];
}

export default function TradingChart({
  weeklyData,
  monthlyData,
  label,
  unit = "",
  color,
  gradientId,
  domain,
}: TradingChartProps) {
  const [range, setRange] = useState<"weekly" | "monthly">("weekly");
  const data = range === "weekly" ? weeklyData : monthlyData;

  const { avg, isUp } = useMemo(() => {
    if (!data.length) return { avg: 0, isUp: false };
    const values = data.map((d) => d.value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
    return { avg: average, isUp: trend >= 0 };
  }, [data]);

  const current = data.length ? data[data.length - 1].value : 0;
  const change = data.length >= 2 ? current - data[0].value : 0;
  const changePercent = data.length >= 2 && data[0].value !== 0
    ? ((change / data[0].value) * 100).toFixed(1)
    : "0.0";

  const tooltipStyle = {
    backgroundColor: "hsl(220, 20%, 10%)",
    border: "1px solid hsl(220, 15%, 25%)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        No data yet. Start logging to see your chart.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with current value + change */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold font-mono tabular-nums">
            {current.toFixed(1)}{unit}
          </p>
          <p className={cn(
            "text-sm font-medium",
            isUp ? "text-neon-green" : "text-destructive"
          )}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}{unit} ({changePercent}%)
          </p>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          <button
            onClick={() => setRange("weekly")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              range === "weekly"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            7D
          </button>
          <button
            onClick={() => setRange("monthly")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              range === "monthly"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            30D
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="50%" stopColor={color} stopOpacity={0.1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="1 4"
              stroke="hsl(220, 15%, 18%)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(215, 15%, 40%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              domain={domain || ["dataMin - 1", "dataMax + 1"]}
              stroke="hsl(215, 15%, 40%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-4}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "hsl(215, 15%, 60%)", marginBottom: 4 }}
              formatter={(value: number) => [`${value.toFixed(1)}${unit}`, label]}
            />
            <ReferenceLine
              y={avg}
              stroke="hsl(215, 15%, 35%)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: "hsl(220, 20%, 10%)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
