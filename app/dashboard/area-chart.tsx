"use client";

import * as React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
  { date: "2024-03-01", adelaide: 156, geelong: 89, wangaratta: 124, nsw: 213 },
  { date: "2024-03-08", adelaide: 165, geelong: 92, wangaratta: 118, nsw: 225 },
  { date: "2024-03-15", adelaide: 172, geelong: 88, wangaratta: 132, nsw: 208 },
  { date: "2024-03-22", adelaide: 168, geelong: 94, wangaratta: 127, nsw: 219 },
  { date: "2024-03-29", adelaide: 159, geelong: 91, wangaratta: 121, nsw: 231 },
  { date: "2024-04-05", adelaide: 163, geelong: 87, wangaratta: 129, nsw: 227 },
  { date: "2024-04-12", adelaide: 171, geelong: 93, wangaratta: 125, nsw: 222 },
  { date: "2024-04-19", adelaide: 174, geelong: 90, wangaratta: 130, nsw: 216 },
  { date: "2024-04-26", adelaide: 167, geelong: 95, wangaratta: 123, nsw: 229 },
  { date: "2024-05-03", adelaide: 162, geelong: 89, wangaratta: 128, nsw: 224 },
  { date: "2024-05-10", adelaide: 169, geelong: 92, wangaratta: 126, nsw: 218 },
  { date: "2024-05-17", adelaide: 175, geelong: 88, wangaratta: 131, nsw: 233 },
];

const colors = {
  adelaide: "hsl(var(--chart-1))",
  geelong: "hsl(var(--chart-2))",
  wangaratta: "hsl(var(--chart-3))",
  nsw: "hsl(var(--chart-4))",
};

export function AreaChart() {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = React.useMemo(() => {
    const now = new Date();
    const days = parseInt(timeRange);
    const startDate = new Date(now.setDate(now.getDate() - days));
    return data.filter((item) => new Date(item.date) >= startDate);
  }, [timeRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {Object.entries(colors).map(([key, color]) => (
                <linearGradient
                  key={key}
                  id={`color-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                value,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            {Object.entries(colors).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fillOpacity={1}
                fill={`url(#color-${key})`}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
