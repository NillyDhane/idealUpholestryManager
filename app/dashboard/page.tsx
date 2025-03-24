"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/app/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Factory, Warehouse, Menu, AlertTriangle, CircleDot, SquareStack, Cable, Hammer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DealerChart from "@/app/components/ui/dealer-chart";
import { Template } from "@/app/components/template";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTable, VanData } from "@/app/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface DealerData {
  name: string;
  count: number;
  trend: number;
}

interface VanDetails {
  vanNumber: string;
  customerName: string;
  model: string;
  benchtops: boolean;
  doors: boolean;
  upholstery: boolean;
  chassis: boolean;
  furniture: boolean;
  comments: string;
  chassisIn: string | null;
  wallsUp: string | null;
  building: string | null;
  wiring: string | null;
  cladding: string | null;
  finishing: string | null;
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dealerData, setDealerData] = useState<DealerData[]>([]);
  const [productionData, setProductionData] = useState<VanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [selectedVan, setSelectedVan] = useState<VanDetails | null>(null);
  const [showVanDetails, setShowVanDetails] = useState(false);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both dealer stats and production data in parallel
      const [statsResponse, productionResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/production-status")
      ]);

      if (!statsResponse.ok) {
        throw new Error(`Stats HTTP error! status: ${statsResponse.status}`);
      }
      if (!productionResponse.ok) {
        throw new Error(`Production HTTP error! status: ${productionResponse.status}`);
      }

      const [statsData, productionData] = await Promise.all([
        statsResponse.json(),
        productionResponse.json()
      ]);

      setDealerData(statsData.stats);
      setProductionData(productionData.productionData);
      
      // Set data ready after a small delay to ensure stable render
      setTimeout(() => setIsDataReady(true), 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVanDetails = async (vanNumber: string) => {
    try {
      let retries = 3;
      let error = null;

      while (retries > 0) {
        try {
          const response = await fetch(`/api/van-details?vanNumber=${vanNumber}`);
          if (response.status === 404) {
            // Van not found - no need to retry
            console.warn(`Van ${vanNumber} not found in the spreadsheet`);
            return;
          }
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setSelectedVan(data);
          setShowVanDetails(true);
          return; // Success, exit the function
        } catch (e) {
          error = e;
          retries--;
          if (retries > 0) {
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // If we get here, all retries failed
      console.error('Error fetching van details after retries:', error);
    } catch (error) {
      console.error('Error in fetchVanDetails:', error);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      setIsDataReady(false);
    };
  }, []);

  const locationIcons = {
    "Adelaide City": Building2,
    "Geelong": Factory,
    "Wangaratta": Warehouse,
    "Ideal": Building2,
  };

  const productionStages = [
    "Chassis In",
    "Walls Up",
    "Building",
    "Wiring",
    "Cladding",
    "Finishing",
    "Not Started"
  ];

  const dealerLocations = [
    "Ideal",
    "Geelong",
    "Wangaratta",
    "Adelaide City"
  ];

  // Filter function for the production data
  const filteredProductionData = productionData.filter(van => {
    const matchesStage = selectedStages.length === 0 || selectedStages.includes(van.status);
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(van.location);
    return matchesStage && matchesLocation;
  });

  const toggleStage = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  // Add status configuration function
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Chassis In":
        return {
          icon: <CircleDot className="h-4 w-4" />,
          color: "text-blue-500 dark:text-blue-400"
        };
      case "Walls Up":
        return {
          icon: <SquareStack className="h-4 w-4" />,
          color: "text-yellow-500 dark:text-yellow-400"
        };
      case "Building":
        return {
          icon: <Building2 className="h-4 w-4" />,
          color: "text-orange-500 dark:text-orange-400"
        };
      case "Wiring":
        return {
          icon: <Cable className="h-4 w-4" />,
          color: "text-purple-500 dark:text-purple-400"
        };
      case "Cladding":
        return {
          icon: <Hammer className="h-4 w-4" />,
          color: "text-pink-500 dark:text-pink-400"
        };
      case "Finishing":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "text-green-500 dark:text-green-400"
        };
      default:
        return {
          icon: <CircleDot className="h-4 w-4" />,
          color: "text-gray-500 dark:text-gray-400"
        };
    }
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:flex hidden"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Overview of caravan distribution
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dealerData.map((stat) => {
                  const Icon =
                    locationIcons[stat.name as keyof typeof locationIcons] ||
                    Building2;
                  return (
                    <Card 
                      key={stat.name}
                      className="transition-all hover:shadow-md hover:border-primary/50"
                    >
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
                {isDataReady && (
                  <>
                    <DealerChart data={dealerData} onVanSelect={fetchVanDetails} />
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold tracking-tight mb-4">Production Status</h2>
                      
                      {/* Filter Controls */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Filter by Production Stage</h3>
                          <div className="flex flex-wrap gap-2">
                            {productionStages.map(stage => {
                              const statusConfig = getStatusConfig(stage);
                              return (
                                <Badge
                                  key={stage}
                                  variant="outline"
                                  className={cn(
                                    "cursor-pointer transition-colors border-muted-foreground/30",
                                    selectedStages.includes(stage) 
                                      ? statusConfig.color
                                      : "hover:bg-muted"
                                  )}
                                  onClick={() => toggleStage(stage)}
                                >
                                  <span className="flex items-center gap-1">
                                    {statusConfig.icon}
                                    {stage}
                                  </span>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Filter by Location</h3>
                          <div className="flex flex-wrap gap-2">
                            {dealerLocations.map(location => (
                              <Badge
                                key={location}
                                variant={selectedLocations.includes(location) ? "default" : "outline"}
                                className={cn(
                                  "cursor-pointer transition-colors",
                                  selectedLocations.includes(location) 
                                    ? "hover:bg-primary/80" 
                                    : "hover:bg-muted"
                                )}
                                onClick={() => toggleLocation(location)}
                              >
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {(selectedStages.length > 0 || selectedLocations.length > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStages([]);
                              setSelectedLocations([]);
                            }}
                            className="text-xs"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>

                      <DataTable 
                        data={filteredProductionData} 
                        onVanSelect={fetchVanDetails} 
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Template>
      </main>

      <Dialog open={showVanDetails} onOpenChange={(open) => setShowVanDetails(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              LTRV {selectedVan?.vanNumber?.split(" ")[1]} - {selectedVan?.model}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {selectedVan?.customerName}
            </DialogDescription>
          </DialogHeader>

          {selectedVan && (
            <div className="space-y-8">
              {/* Component Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Component Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Benchtops", status: selectedVan.benchtops },
                    { label: "Doors", status: selectedVan.doors },
                    { label: "Upholstery", status: selectedVan.upholstery },
                    { label: "Chassis", status: selectedVan.chassis },
                    { label: "Furniture", status: selectedVan.furniture },
                  ].map((component) => (
                    <div
                      key={component.label}
                      className={`p-3 rounded-lg border ${
                        component.status
                          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-sm ${
                            component.status
                              ? "bg-green-500"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            component.status
                              ? "text-green-700 dark:text-green-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          {component.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              {selectedVan.comments && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Comments
                    {selectedVan.comments.toLowerCase().includes('urgent') && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </h3>
                  <div className={cn(
                    "p-4 rounded-lg border",
                    selectedVan.comments.toLowerCase().includes('urgent')
                      ? "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
                      : "bg-muted/50 border-muted"
                  )}>
                    <p className={cn(
                      "text-sm",
                      selectedVan.comments.toLowerCase().includes('urgent')
                        ? "text-orange-700 dark:text-orange-300"
                        : "text-muted-foreground"
                    )}>
                      {selectedVan.comments}
                    </p>
                  </div>
                </div>
              )}

              {/* Production Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Production Timeline</h3>
                <div className="grid gap-3">
                  {[
                    { label: "Chassis In", date: selectedVan.chassisIn },
                    { label: "Walls Up", date: selectedVan.wallsUp },
                    { label: "Building", date: selectedVan.building },
                    { label: "Wiring", date: selectedVan.wiring },
                    { label: "Cladding", date: selectedVan.cladding },
                    { label: "Finishing", date: selectedVan.finishing },
                  ].map((stage) => (
                    <div
                      key={stage.label}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        stage.date 
                          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" 
                          : "bg-muted/50 border-muted"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        stage.date ? "text-green-700 dark:text-green-300" : ""
                      )}>
                        {stage.label}
                      </span>
                      <span className={cn(
                        "text-sm",
                        stage.date 
                          ? "text-green-700 dark:text-green-300"
                          : "text-muted-foreground"
                      )}>
                        {stage.date || "Not started"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
