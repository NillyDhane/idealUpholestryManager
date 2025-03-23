"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from "recharts";
import { useTheme } from "next-themes";

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

interface CaravansChartProps {
  data: Array<{
    name: string;
    count: number;
    trend: number;
  }>;
}

// Sample data for the table - this should be replaced with real data from your Google Sheet
const sampleTableData: VanData[] = [
  {
    vanNumber: "V001",
    customerName: "John Smith",
    model: "Cape Otway 18.6",
    status: "Chassis In",
  },
  {
    vanNumber: "V002",
    customerName: "Jane Doe",
    model: "Barrington 21",
    status: "Building",
  },
  {
    vanNumber: "V003",
    customerName: "Mike Johnson",
    model: "Opulance 22",
    status: "Wiring",
  },
  {
    vanNumber: "V004",
    customerName: "Sarah Williams",
    model: "Voyager 19.6",
    status: "Cladding",
  },
  {
    vanNumber: "V005",
    customerName: "Robert Brown",
    model: "Cape Otway 20.5",
    status: "Walls Up",
  },
  {
    vanNumber: "V006",
    customerName: "Emily Davis",
    model: "Barrington 22.5",
    status: "Finishing",
  },
  {
    vanNumber: "V007",
    customerName: "David Wilson",
    model: "Cape Otway 17",
    status: "Chassis In",
  },
  {
    vanNumber: "V008",
    customerName: "Lisa Anderson",
    model: "Opulance 22",
    status: "Building",
  },
  {
    vanNumber: "V009",
    customerName: "James Taylor",
    model: "Barrington 21.5",
    status: "Wiring",
  },
  {
    vanNumber: "V010",
    customerName: "Michelle Lee",
    model: "Cape Otway 18.6",
    status: "Cladding",
  },
  {
    vanNumber: "V011",
    customerName: "Peter White",
    model: "Voyager 19.6",
    status: "Finishing",
  },
  {
    vanNumber: "V012",
    customerName: "Karen Martin",
    model: "Barrington Quad 23",
    status: "Walls Up",
  },
];

// Get color for each bar based on location
function getBarColor(location: string): string {
  switch (location) {
    case "Adelaide City":
      return "hsl(0 0% 25.1%)";
    case "Geelong":
      return "hsl(200.4 98% 39.4%)";
    case "Wangaratta":
      return "hsl(174.7 83.9% 31.6%)";
    case "Ideal":
      return "hsl(0 84.2% 60.2%)";
    default:
      return "hsl(var(--primary))";
  }
}

export function CaravansChart({ data }: CaravansChartProps) {
  const { theme } = useTheme();

  // Transform data for the charts
  const chartData = data.map((item) => ({
    location: item.name,
    count: item.count,
    color: getBarColor(item.name),
  }));

  const pieData = data.map((item) => ({
    name: item.name,
    value: item.count,
    fill: getBarColor(item.name),
  }));

  // Calculate total caravans
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate average trend
  const avgTrend =
    data.reduce((sum, item) => sum + item.trend, 0) / data.length;

  // Chart configurations
  const barChartConfig: ChartConfig = {
    count: {
      label: "Caravan Count",
      color: "currentColor",
    },
    xAxis: {
      angle: 0,
      textAnchor: "middle",
      style: {
        fontWeight: "bold",
      },
    },
  };

  const pieChartConfig: ChartConfig = {
    value: {
      label: "Caravan Share",
      color: "currentColor",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="@container">
          <CardHeader className="pb-2">
            <CardTitle>Caravan Distribution</CardTitle>
            <CardDescription>Total Caravans: {total}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            <div className="flex-1">
              <ChartContainer config={barChartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="location"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      fontSize={12}
                      interval={0}
                      angle={barChartConfig.xAxis.angle}
                      textAnchor={barChartConfig.xAxis.textAnchor}
                      style={barChartConfig.xAxis.style}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      fill={
                        theme === "dark"
                          ? "hsl(var(--foreground))"
                          : "hsl(var(--primary))"
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="px-6 py-2 flex items-center justify-end gap-2 text-xs text-muted-foreground border-t">
              <span className="font-medium">
                Average distribution: {avgTrend.toFixed(1)}%
              </span>
              <TrendingUp className="h-3 w-3" />
            </div>
          </CardContent>
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
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
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

      <Card>
        <CardHeader>
          <CardTitle>Production Status</CardTitle>
          <CardDescription>
            Current status of caravans in production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={sampleTableData} />
        </CardContent>
      </Card>
    </div>
  );
}
