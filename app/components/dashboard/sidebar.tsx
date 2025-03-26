"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/contexts/AuthContext";
import { LayoutDashboard, Sofa, Zap, Factory, Menu } from "lucide-react";

interface SidebarProps {
  defaultCollapsed?: boolean;
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upholstery", href: "/upholstery", icon: Sofa },
  { name: "Electrical", href: "/electrical", icon: Zap },
  { name: "Production", href: "/production", icon: Factory },
];

export function Sidebar({
  className,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string>("dashboard")

  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <nav className="flex flex-col h-full bg-sidebar border-r shadow-sm">
            <div className="p-4 pb-2 flex justify-between items-center border-b">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <span className="text-lg font-semibold text-primary-foreground">
                    IC
                  </span>
                </div>
                <span className="text-lg font-semibold">Ideal Caravans</span>
              </div>
              {user && (
                <Button onClick={signOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 overflow-auto">
              <div className="space-y-1 p-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <span
                        className={cn(
                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "transparent"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>

            {user && (
              <div className="border-t p-4 bg-background/50">
                <div className="flex items-center gap-2">
                  <Avatar className="border border-border">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-muted">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <nav
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-sidebar border-r shadow-sm transition-all duration-300",
          collapsed ? "w-[80px]" : "w-[300px]",
          className
        )}
      >
        <div className="p-4 pb-2 flex justify-between items-center border-b">
          <div
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-lg font-semibold text-primary-foreground">
                IC
              </span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold">Ideal Caravans</span>
            )}
          </div>
          {!collapsed && user && (
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <span
                    className={cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "transparent",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn("h-4 w-4", !collapsed && "mr-2")}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </span>
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        {user && (
          <div className="border-t p-4 bg-background/50">
            <div
              className={cn(
                "flex items-center gap-2",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="border border-border">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-muted">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
