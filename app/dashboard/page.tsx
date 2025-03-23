"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/app/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Factory, Warehouse, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaravansChart } from "@/app/components/ui/dealer-chart";
import { Template } from "@/app/components/template";
import { cn } from "@/lib/utils";

interface DealerData {
  name: string;
  count: number;
  trend: number;
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dealerData, setDealerData] = useState<DealerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDealerData(data.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const locationIcons = {
    "Adelaide City": Building2,
    "Geelong": Factory,
    "Wangaratta": Warehouse,
    "Ideal": Building2,
  };

  if (isLoading || error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        <main className="flex-1 ml-[300px] lg:ml-[80px]">
          <div className="flex items-center justify-center h-screen">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <div className="text-red-500">Error: {error}</div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <main
        className={cn(
          "flex-1 overflow-auto",
          sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[300px]",
          "ml-0" // Mobile default
        )}
      >
        <Template>
          <div className="@container/main min-h-screen">
            <div className="flex flex-col gap-4 p-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:flex hidden"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dealerData.map((stat) => {
                  const Icon =
                    locationIcons[stat.name as keyof typeof locationIcons] ||
                    Building2;
                  return (
                    <Card key={stat.name}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.name}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.count}</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.trend.toFixed(1)}% of total caravans
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="px-0 lg:px-0">
                <CaravansChart data={dealerData} />
              </div>
            </div>
          </div>
        </Template>
      </main>
    </div>
  );
}
