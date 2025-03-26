"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

export default function ImportantTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
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
      if (!response.ok) {
        throw new Error("Failed to complete task");
      }
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 bg-card rounded-lg border shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
            {!task.completed && (
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="text-sm text-primary hover:text-primary/80"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 