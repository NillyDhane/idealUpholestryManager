"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AreaChartProps {
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
}

const colors = {
  "Adelaide City": "hsl(var(--chart-1))",
  "Geelong": "hsl(var(--chart-2))",
  "Wangaratta": "hsl(var(--chart-3))",
  "Ideal": "hsl(var(--chart-4))",
};

export function AreaChart({ data }: AreaChartProps) {
  const locations = Object.keys(data[0] || {}).filter((key) => key !== "date");

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const [year, month] = value.split("-");
              return `${month}/${year}`;
            }}
            stroke="#888888"
            fontSize={12}
          />
          <YAxis stroke="#888888" fontSize={12} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;

              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">
                      {label.split("-")[1]}/{label.split("-")[0]}
                    </div>
                    {payload.map((entry) => (
                      <div
                        key={entry.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                colors[entry.name as keyof typeof colors],
                            }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          {locations.map((location) => (
            <Area
              key={location}
              type="monotone"
              dataKey={location}
              stroke={colors[location as keyof typeof colors]}
              fill={colors[location as keyof typeof colors]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
