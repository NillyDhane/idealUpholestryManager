"use client";

import * as React from "react";
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

interface ImportantTask {
  id: string;
  title: string;
  van_number: string;
  customer_name: string;
  issue: string;
  warranty_handled_by: 'Destiny' | 'Danny' | 'Nish';
  assigned_to: 'Plumbers' | 'Ridma' | 'Ravi';
  due_date: string;
  created_at: string;
  is_completed?: boolean;
}

export function ImportantTasks() {
  const [tasks, setTasks] = React.useState<ImportantTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showCompleteModal, setShowCompleteModal] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<ImportantTask | null>(null);
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
  const [taskToComplete, setTaskToComplete] = React.useState<ImportantTask | null>(null);
  const [assigneeFilter, setAssigneeFilter] = React.useState<string | null>(null);
  const [handlerFilter, setHandlerFilter] = React.useState<string | null>(null);

  // Function to fetch tasks - defined outside useEffect so it can be reused
  const fetchTasks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching tasks...');
      const response = await fetch('/api/important-tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      console.log('Tasks fetched:', data);
      // Filter out completed tasks
      const activeTasks = data.filter((task: ImportantTask) => !task.is_completed);
      setTasks(activeTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tasks on component mount
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on selected timeframe
  const filteredTasks = React.useMemo(() => {
    console.log('Filtering tasks:', tasks);
    if (!tasks || tasks.length === 0) {
      console.log('No tasks to filter');
      return [];
    }

    let filtered = [...tasks];

    // Apply date filter
    if (filter !== 'all') {
      const now = new Date();
      const startDate = startOfDay(now);
      const endDate = filter === '7days' 
        ? endOfDay(addDays(now, 7))
        : endOfDay(addDays(now, 30));

      console.log('Date range for filtering:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });

      filtered = filtered.filter(task => {
        try {
          const taskDate = new Date(task.due_date);
          // Skip invalid dates
          if (isNaN(taskDate.getTime())) {
            return false;
          }
          
          return isWithinInterval(taskDate, { start: startDate, end: endDate });
        } catch (err) {
          console.error('Error filtering task by date:', err, task);
          return false;
        }
      });
    }

    // Apply assignee filter
    if (assigneeFilter) {
      filtered = filtered.filter(task => task.assigned_to === assigneeFilter);
    }

    // Apply handler filter
    if (handlerFilter) {
      filtered = filtered.filter(task => task.warranty_handled_by === handlerFilter);
    }
    
    return filtered;
  }, [tasks, filter, assigneeFilter, handlerFilter]);

  // Get urgency level based on due date
  const getUrgencyLevel = (dueDate: string) => {
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 2) return 'high';
    if (daysUntilDue <= 5) return 'medium';
    return 'low';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format the date to ISO string for Supabase
      const formattedData = {
        ...formData,
        due_date: formData.due_date.toISOString(),
      };
      
      console.log('Submitting task with data:', formattedData);
      
      const response = await fetch('/api/important-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create task');
      }
      
      // Reset form and close modal
      setShowAddModal(false);
      setFormData({
        title: '',
        van_number: '',
        customer_name: '',
        issue: '',
        warranty_handled_by: '',
        assigned_to: '',
        due_date: new Date(),
      });
      
      // Fetch the updated list of tasks
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (task: ImportantTask) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  // Open complete confirmation modal
  const handleCompleteClick = (task: ImportantTask) => {
    setTaskToComplete(task);
    setIsCompleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedTask) return;
    
    try {
      console.log('Deleting task:', selectedTask.id);
      const response = await fetch(`/api/important-tasks/${selectedTask.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete task');
      }
      
      // Remove task from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
      setShowDeleteModal(false);
      setSelectedTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Handle complete confirmation
  const handleConfirmComplete = async () => {
    if (!taskToComplete) return;
    
    try {
      console.log("Marking task as completed:", taskToComplete.id);
      const response = await fetch(`/api/important-tasks/${taskToComplete.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error marking task as completed:", errorData);
        return;
      }

      await fetchTasks();
      setIsCompleteModalOpen(false);
      
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Important Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Important Tasks</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: '7days' | 'month' | 'all') => setFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Next 7 Days</SelectItem>
                <SelectItem value="month">Next Month</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={assigneeFilter || "all"} 
              onValueChange={(value) => setAssigneeFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assigned to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="Plumbers">Plumbers</SelectItem>
                <SelectItem value="Ridma">Ridma</SelectItem>
                <SelectItem value="Ravi">Ravi</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={handlerFilter || "all"} 
              onValueChange={(value) => setHandlerFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Warranty handler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Handlers</SelectItem>
                <SelectItem value="Destiny">Destiny</SelectItem>
                <SelectItem value="Danny">Danny</SelectItem>
                <SelectItem value="Nish">Nish</SelectItem>
              </SelectContent>
            </Select>

            {(assigneeFilter || handlerFilter) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setAssigneeFilter(null);
                  setHandlerFilter(null);
                }}
                className="h-10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px] mt-6">
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <span className="text-muted-foreground">Van:</span> 
                              LTRV-{task.van_number}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <span className="text-muted-foreground">Customer:</span> 
                              {task.customer_name}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" />
                              <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Assigned: {task.assigned_to}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Warranty: {task.warranty_handled_by}</span>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-muted-foreground">{task.issue}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCompleteClick(task)}>
                          <Check className="mr-2 h-4 w-4" />
                          <span>Mark as complete</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(task)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-3 text-muted-foreground">
                {tasks.length === 0 ? (
                  <p>No tasks in database yet</p>
                ) : (
                  <p>No tasks found for the selected timeframe</p>
                )}
              </div>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Add Task Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="van_number">Van Number</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">LTRV-</span>
                  <Input
                    id="van_number"
                    value={formData.van_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                      setFormData({ ...formData, van_number: value });
                    }}
                    className="flex-1"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={5}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue">Issue</Label>
              <Input
                id="issue"
                value={formData.issue}
                onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warranty_handled_by">Warranty Handled By</Label>
                <Select
                  value={formData.warranty_handled_by}
                  onValueChange={value => setFormData(prev => ({ ...prev, warranty_handled_by: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select handler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Destiny">Destiny</SelectItem>
                    <SelectItem value="Danny">Danny</SelectItem>
                    <SelectItem value="Nish">Nish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={value => setFormData(prev => ({ ...prev, assigned_to: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbers">Plumbers</SelectItem>
                    <SelectItem value="Ridma">Ridma</SelectItem>
                    <SelectItem value="Ravi">Ravi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "EEEE, MMMM do, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Select due date</h4>
                      <p className="text-xs text-muted-foreground">Tasks are shown in the Important Tasks list based on due date.</p>
                    </div>
                    <div className="pt-2 pb-1">
                      <CalendarComponent
                        mode="single"
                        selected={formData.due_date}
                        onSelect={date => setFormData(prev => ({ ...prev, due_date: date || new Date() }))}
                        initialFocus
                        disabled={(date) => date < new Date()} // Disable past dates
                      />
                    </div>
                    <div className="p-2 border-t flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFormData(prev => ({ ...prev, due_date: new Date() }))}
                        className="text-sm px-2 h-8"
                      >
                        Set to today
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task completion confirmation modal */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-lg">
          <DialogHeader className="space-y-3 pb-2">
            <DialogTitle className="text-xl font-semibold">Repair/Warranty Completed</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Are you sure you want to mark this task as complete? This will hide it from the important tasks list.
            </DialogDescription>
          </DialogHeader>
          
          {taskToComplete && (
            <div className="bg-muted/40 p-5 my-4 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">{taskToComplete.title}</h3>
              <div className="grid gap-3 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Issue:</span> 
                  <span>{taskToComplete.issue}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Customer:</span> 
                  <span>{taskToComplete.customer_name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Van Number:</span> 
                  <span>LTRV-{taskToComplete.van_number}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Due Date:</span> 
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <span>{format(new Date(taskToComplete.due_date), 'EEEE, MMMM do, yyyy')}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Assigned To:</span> 
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {taskToComplete.assigned_to}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Warranty Handled By:</span> 
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {taskToComplete.warranty_handled_by}
                  </span>
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between gap-4 pt-4 border-t mt-2">
            <Button
              variant="outline"
              onClick={() => setIsCompleteModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmComplete}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md border-none shadow-lg">
          <DialogHeader className="space-y-3 pb-2">
            <DialogTitle className="text-xl font-semibold">Delete Task</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Are you sure you want to delete this task? The task data will remain in the database for future reference, but will be removed from your active tasks.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="bg-muted/40 p-5 my-4 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">{selectedTask.title}</h3>
              <div className="grid gap-3 text-sm">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Issue:</span> 
                  <span>{selectedTask.issue}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Customer:</span> 
                  <span>{selectedTask.customer_name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Van Number:</span> 
                  <span>LTRV-{selectedTask.van_number}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Due Date:</span> 
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <span>{format(new Date(selectedTask.due_date), 'EEEE, MMMM do, yyyy')}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Assigned To:</span> 
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedTask.assigned_to}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-32">Warranty Handled By:</span> 
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedTask.warranty_handled_by}
                  </span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex sm:justify-between gap-4 pt-4 border-t mt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 