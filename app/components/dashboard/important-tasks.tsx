"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Calendar, AlertTriangle, User, Tag, MoreVertical, Trash, Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Calendar as CalendarComponent } from "@/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/lib/utils";
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

export function ImportantTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showCompleteModal, setShowCompleteModal] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [filter, setFilter] = React.useState<'7days' | 'month' | 'all'>('all');
  const [formData, setFormData] = React.useState({
    title: '',
    van_number: '',
    customer_name: '',
    issue: '',
    warranty_handled_by: '',
    assigned_to: '',
    due_date: new Date(),
  });
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [taskToComplete, setTaskToComplete] = React.useState<Task | null>(null);
  const [assigneeFilter, setAssigneeFilter] = React.useState<string | null>(null);
  const [handlerFilter, setHandlerFilter] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to complete task");
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ));
      toast.success("Task completed successfully");
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Important Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Important Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              {!task.completed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCompleteTask(task.id)}
                >
                  Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 