"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';

// Interfaces
interface Supplier {
  supplier_id: number;
  name: string;
  contact_info: string;
}

interface SupplierFormInputs {
  name: string;
  contact_info: string;
}

interface SupplierFormProps {
  supplier?: Supplier | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SupplierForm({ supplier, isOpen, onOpenChange, onSuccess }: SupplierFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<SupplierFormInputs>();
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEditMode = Boolean(supplier);

  // Pre-fill form in Edit mode or reset in Add mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && supplier) {
        setValue("name", supplier.name || '');
        setValue("contact_info", supplier.contact_info || ''); 
      } else {
        reset({ name: '', contact_info: '' });
      }
      setApiError(null);
    }
  }, [supplier, isEditMode, isOpen, setValue, reset]);

  const onSubmit: SubmitHandler<SupplierFormInputs> = async (data) => {
    setApiError(null);

    const url = isEditMode ? `/api/suppliers?id=${supplier?.supplier_id}` : '/api/suppliers';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'add'} supplier`);
      }

      toast({ title: "Success", description: `Supplier ${isEditMode ? 'updated' : 'added'} successfully.` });
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'add'} supplier`;
      setApiError(message);
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} supplier:`, error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setApiError(null);
    }
    onOpenChange(open);
  };

  // Only render if open
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div style={{ zIndex: 1000 }} className="p-6 bg-background">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {isEditMode 
                ? `Edit Supplier #${supplier?.supplier_id}` 
                : 'Add New Supplier'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the supplier's details." 
                : "Enter the new supplier's details."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier-name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="supplier-name"
                  {...register("name", { required: "Supplier name is required" })}
                  placeholder="e.g., PharmaSupply Ltd."
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier-contact" className="text-right">
                Contact Info
              </Label>
              <div className="col-span-3">
                <Input
                  id="supplier-contact"
                  {...register("contact_info")}
                  placeholder="e.g., 123-456-7890 / contact@pharma.com"
                />
              </div>
            </div>
            
            {/* API Error */}
            {apiError && (
              <div className="p-3 rounded bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{apiError}</span>
              </div>
            )}
            
            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Supplier'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
