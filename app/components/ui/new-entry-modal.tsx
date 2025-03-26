"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "./checkbox";
import { Textarea } from "./textarea";
import { Switch } from "./switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
}

export function NewEntryModal({ isOpen, onClose, onSubmit }: NewEntryModalProps) {
  const [isManualVanNumber, setIsManualVanNumber] = React.useState(false);
  const [formData, setFormData] = React.useState({
    vanNumber: "",
    customerName: "",
    model: "",
    requirements: {
      benchtops: false,
      doors: false,
      upholestry: false,
      chassis: false,
      furniture: false,
    },
    notes: "",
    productionStatus: {
      chassisIn: false,
      wallsUp: false,
      building: false,
      wiring: false,
      cladding: false,
      finishing: false,
    }
  });

  const [errors, setErrors] = React.useState({
    vanNumber: "",
    customerName: "",
    model: "",
  });

  // Validation functions
  const validateVanNumber = (value: string) => {
    if (!value) return "Van number is required";
    if (!/^\d+$/.test(value)) return "Van number must contain only numbers";
    return "";
  };

  const validateCustomerName = (value: string) => {
    if (!value) return "Customer name is required";
    if (!/^[A-Za-z\s]+$/.test(value)) return "Customer name must contain only letters and spaces";
    return "";
  };

  const validateModel = (value: string) => {
    if (!value) return "Model is required";
    return "";
  };

  // Handle form submission with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const vanNumberError = validateVanNumber(formData.vanNumber);
    const customerNameError = validateCustomerName(formData.customerName);
    const modelError = validateModel(formData.model);

    setErrors({
      vanNumber: vanNumberError,
      customerName: customerNameError,
      model: modelError,
    });

    // Check if there are any errors
    if (vanNumberError || customerNameError || modelError) {
      return;
    }

    // If validation passes, submit the form
    onSubmit({
      ...formData,
      vanNumber: `LTRV ${formData.vanNumber}`, // Add LTRV prefix to the van number
    });
  };

  // Handle cladding and finishing dependency
  const handleStatusChange = (status: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      productionStatus: {
        ...prev.productionStatus,
        [status]: checked,
        ...(status === 'cladding' && checked ? { finishing: true } : {})
      }
    }));
  };

  const generateVanNumber = () => {
    // This is a placeholder - we'll implement the actual logic later
    setFormData(prev => ({
      ...prev,
      vanNumber: "25102" // Example without LTRV prefix
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Add New Production Entry</DialogTitle>
          <DialogDescription>
            Create a new production entry with van details and requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Van Number with toggle */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="vanNumber" className="font-bold">Van Number</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="manual-toggle" className="text-sm text-muted-foreground">Manual Entry</Label>
                  <Switch
                    id="manual-toggle"
                    checked={isManualVanNumber}
                    onCheckedChange={setIsManualVanNumber}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">LTRV</span>
                  <Input
                    id="vanNumber"
                    placeholder="25102"
                    className="flex-1"
                    value={formData.vanNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, vanNumber: value }));
                      setErrors(prev => ({ ...prev, vanNumber: validateVanNumber(value) }));
                    }}
                    disabled={!isManualVanNumber}
                  />
                </div>
                {!isManualVanNumber && (
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={generateVanNumber}
                  >
                    Auto-generate
                  </Button>
                )}
              </div>
              {errors.vanNumber && (
                <span className="text-xs text-red-500">{errors.vanNumber}</span>
              )}
            </div>

            {/* Customer Name */}
            <div className="grid gap-3">
              <Label htmlFor="customerName" className="font-bold">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, customerName: value }));
                  setErrors(prev => ({ ...prev, customerName: validateCustomerName(value) }));
                }}
              />
              {errors.customerName && (
                <span className="text-xs text-red-500">{errors.customerName}</span>
              )}
            </div>

            {/* Model */}
            <div className="grid gap-3">
              <Label htmlFor="model" className="font-bold">Model</Label>
              <Input
                id="model"
                placeholder="Enter model"
                value={formData.model}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, model: value }));
                  setErrors(prev => ({ ...prev, model: validateModel(value) }));
                }}
              />
              {errors.model && (
                <span className="text-xs text-red-500">{errors.model}</span>
              )}
            </div>

            {/* Furniture Stages Checkboxes */}
            <div className="grid gap-3">
              <Label className="font-bold">Furniture Stages</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.requirements).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          requirements: {
                            ...prev.requirements,
                            [key]: checked === true
                          }
                        }))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200"
                    />
                    <Label htmlFor={key} className="capitalize">{key}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Notes */}
            <div className="grid gap-3">
              <Label htmlFor="notes" className="font-bold">Special Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any special notes or requirements..."
                className="min-h-[120px] resize-y"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Production Status */}
            <div className="grid gap-3">
              <Label className="font-bold">Production Status</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.productionStatus).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handleStatusChange(key, checked === true)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200"
                      disabled={key === 'finishing' && formData.productionStatus.cladding}
                    />
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center gap-4 mt-6">
            <Button 
              type="submit" 
              variant="default"
              size="sm"
              className="text-xs"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 