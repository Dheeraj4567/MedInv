"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
interface DrugCategory {
  drug_category_id: number;
  drug_category_name: string;
  common_uses: string | null;
}

interface CategoryFormInputs {
  drug_category_name: string;
  common_uses?: string;
}

interface DrugCategoryFormProps {
  category?: DrugCategory | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DrugCategoryForm({ category, isOpen, onOpenChange, onSuccess }: DrugCategoryFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CategoryFormInputs>();
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEditMode = Boolean(category);

  // Pre-fill form in Edit mode or reset in Add mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && category) {
        setValue("drug_category_name", category.drug_category_name || '');
        setValue("common_uses", category.common_uses || '');
      } else {
        reset({ drug_category_name: '', common_uses: '' });
      }
      setApiError(null);
    }
  }, [category, isEditMode, isOpen, setValue, reset]);

  const onSubmit: SubmitHandler<CategoryFormInputs> = async (data) => {
    setApiError(null);

    const payload = {
      drug_category_name: data.drug_category_name,
      common_uses: data.common_uses || null,
    };

    const url = isEditMode ? `/api/drug-categories?id=${category?.drug_category_id}` : '/api/drug-categories';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'add'} category`);
      }

      toast({ title: "Success", description: `Drug category ${isEditMode ? 'updated' : 'added'} successfully.` });
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'add'} category`;
      setApiError(message);
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} drug category:`, error);
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
                ? `Edit Drug Category #${category?.drug_category_id}` 
                : 'Add New Drug Category'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the category details." 
                : "Enter the details for the new category."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-form-name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="cat-form-name"
                  {...register("drug_category_name", { required: "Category name is required" })}
                  placeholder="e.g., Analgesics"
                />
                {errors.drug_category_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.drug_category_name.message}</p>
                )}
              </div>
            </div>
            
            {/* Common Uses */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="cat-form-uses" className="text-right pt-2">
                Common Uses
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="cat-form-uses"
                  {...register("common_uses")}
                  placeholder="e.g., Pain relief, fever reduction"
                  rows={3}
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
                  isEditMode ? 'Save Changes' : 'Add Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
