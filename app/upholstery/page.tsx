"use client";

import { useState } from "react";
import { Sidebar } from "@/app/components/dashboard/sidebar";
import UpholsteryForm from "@/app/components/UpholsteryForm";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Template } from "@/app/components/template";
import { cn } from "@/lib/utils";
import AdminLayoutManager from "@/app/components/AdminLayoutManager";
import PresetsLoader from "@/app/components/PresetsLoader";
import type { UpholsteryOrder } from "@/app/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function UpholsteryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAdminLayout, setShowAdminLayout] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<UpholsteryOrder | null>(null);

  const handleTemplateSelect = (template: UpholsteryOrder) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

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
                      Upholstery Orders
                    </h1>
                    <p className="text-muted-foreground">
                      Create and manage upholstery orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplates(true)}
                  >
                    Load Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAdminLayout(true)}
                  >
                    Admin Layout
                  </Button>
                </div>
              </div>
              <div className="pb-8">
                <UpholsteryForm preset={selectedTemplate} />
              </div>
            </div>
          </div>
        </Template>
      </main>

      <Dialog open={showAdminLayout} onOpenChange={setShowAdminLayout}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Layout Management</DialogTitle>
            <DialogDescription>
              Manage upholstery layout templates and images
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AdminLayoutManager onLayoutChange={() => setShowAdminLayout(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Select a saved template to load its settings
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PresetsLoader onPresetSelect={handleTemplateSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
