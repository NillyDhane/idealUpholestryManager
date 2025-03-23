"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Label,
  LabelList,
  CartesianGrid,
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ProductionStatusData } from "@/app/lib/server/googleSheets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";
import type { ChartConfig } from "./chart";
import { DataTable, type VanData } from "./data-table";

interface DealerChartProps {
  data: Array<{
    name: string;
    count: number;
    trend: number;
  }>;
  onVanSelect?: (vanNumber: string) => void;
}

// Get color for each bar based on location
function getBarColor(location: string): string {
  switch (location) {
    case "Adelaide City":
      return "hsl(var(--chart-1))";
    case "Geelong":
      return "hsl(var(--chart-2))";
    case "Wangaratta":
      return "hsl(var(--chart-3))";
    case "Ideal":
      return "hsl(var(--chart-4))";
    default:
      return "hsl(var(--chart-5))";
  }
}

const DealerChart: React.FC<DealerChartProps> = ({ data, onVanSelect }) => {
  const { theme } = useTheme();

  // Transform data for the charts
  const chartData = data.map((item) => ({
    location: item.name,
    count: item.count,
    fill: getBarColor(item.name),
  }));

  const pieData = data.map((item) => ({
    name: item.name,
    value: item.count,
    fill: getBarColor(item.name),
  }));

  // Calculate total caravans
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate average trend
  const avgTrend = data.reduce((sum, item) => sum + item.trend, 0) / data.length;

  // Chart configurations
  const barChartConfig: ChartConfig = {
    count: {
      label: "Caravan Count",
      color: "currentColor",
    },
    "Adelaide City": {
      label: "Adelaide City",
      color: "hsl(var(--chart-1))",
    },
    "Geelong": {
      label: "Geelong",
      color: "hsl(var(--chart-2))",
    },
    "Wangaratta": {
      label: "Wangaratta",
      color: "hsl(var(--chart-3))",
    },
    "Ideal": {
      label: "Ideal",
      color: "hsl(var(--chart-4))",
    },
  };

  const pieChartConfig: ChartConfig = {
    value: {
      label: "Count",
      color: "currentColor",
    },
    "Adelaide City": {
      label: "Adelaide City",
      color: "hsl(var(--chart-1))",
    },
    "Geelong": {
      label: "Geelong",
      color: "hsl(var(--chart-2))",
    },
    "Wangaratta": {
      label: "Wangaratta",
      color: "hsl(var(--chart-3))",
    },
    "Ideal": {
      label: "Ideal",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="@container">
          <CardHeader>
            <CardTitle>Caravan Distribution</CardTitle>
            <CardDescription>Total Caravans: {total}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 0,
                    right: 50,
                    left: 100,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="location"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    hide
                  />
                  <XAxis type="number" hide />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {payload[0].payload.location}
                                </span>
                                <span className="font-medium">
                                  {payload[0].value} caravans
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="currentColor"
                    radius={[4, 4, 4, 4]}
                    maxBarSize={40}
                  >
                    <LabelList
                      dataKey="location"
                      position="left"
                      offset={8}
                      className="fill-foreground"
                      fontSize={12}
                    />
                    <LabelList
                      dataKey="count"
                      position="right"
                      offset={8}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing total caravans by location
            </div>
          </CardFooter>
        </Card>

        <Card className="@container">
          <CardHeader className="items-center pb-2">
            <CardTitle>Caravan Share</CardTitle>
            <CardDescription>Distribution by Location</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            <div className="flex-1">
              <ChartContainer config={pieChartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">
                                  {payload[0].name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {payload[0].value} caravans
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="75%"
                      strokeWidth={5}
                      cx="50%"
                      cy="50%"
                      startAngle={0}
                      endAngle={360}
                      animationBegin={0}
                      animationDuration={2000}
                      animateNewValues={true}
                      isAnimationActive={true}
                    >
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox ?? { cx: 0, cy: 0 };
                          const fontSize = 24;
                          const subTextSize = 14;
                          return (
                            <text
                              x={cx}
                              y={cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={cx}
                                y={cy - fontSize / 2}
                                className="fill-foreground font-bold"
                                style={{ fontSize }}
                              >
                                {total}
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + fontSize / 2}
                                className="fill-muted-foreground"
                                style={{ fontSize: subTextSize }}
                              >
                                Total Caravans
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="px-6 py-2 flex flex-col items-center gap-1 text-sm border-t">
              <div className="flex items-center gap-2 font-medium leading-none">
                Average trend: {avgTrend.toFixed(1)}%{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Current distribution of caravans by location
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DealerChart;
