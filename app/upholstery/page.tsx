"use client";

import { useState } from "react";
import { Sidebar } from "@/app/components/dashboard/sidebar";
import UpholsteryForm from "@/app/components/UpholsteryForm";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Template } from "@/app/components/template";
import { cn } from "@/lib/utils";

export default function UpholsteryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Upholstery Orders
                  </h1>
                  <p className="text-muted-foreground">
                    Create and manage upholstery orders
                  </p>
                </div>
              </div>
              <div className="pb-8">
                <UpholsteryForm />
              </div>
            </div>
          </div>
        </Template>
      </main>
    </div>
  );
}
