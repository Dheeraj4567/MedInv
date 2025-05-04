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
interface Patient {
  patient_id: number;
  name: string;
  email: string | null;
  phone_number: string | null;
}

interface PatientFormInputs {
  name: string;
  email?: string;
  phone_number?: string;
}

interface PatientFormProps {
  patient?: Patient | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PatientForm({ patient, isOpen, onOpenChange, onSuccess }: PatientFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PatientFormInputs>();
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  const isEditMode = Boolean(patient);

  // Pre-fill form in Edit mode or reset in Add mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && patient) {
        setValue("name", patient.name || '');
        setValue("email", patient.email || '');
        setValue("phone_number", patient.phone_number || '');
      } else {
        reset({ name: '', email: '', phone_number: '' });
      }
      setApiError(null);
    }
  }, [patient, isEditMode, isOpen, setValue, reset]);

  const onSubmit: SubmitHandler<PatientFormInputs> = async (data) => {
    setApiError(null);

    // Filter out empty optional fields before sending
    const payload: any = { name: data.name };
    if (data.email) payload.email = data.email;
    if (data.phone_number) payload.phone_number = data.phone_number;

    const url = isEditMode ? `/api/patients?id=${patient?.patient_id}` : '/api/patients';
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
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'add'} patient`);
      }

      toast({ title: "Success", description: `Patient ${isEditMode ? 'updated' : 'added'} successfully.` });
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'add'} patient`;
      setApiError(message);
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} patient:`, error);
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
                ? `Edit Patient #${patient?.patient_id}` 
                : 'Add New Patient'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the patient's details." 
                : "Enter the new patient's details."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-form-name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="patient-form-name"
                  {...register("name", { required: "Patient name is required" })}
                  placeholder="e.g., John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>
            
            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-form-email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="patient-form-email"
                  type="email"
                  {...register("email")}
                  placeholder="e.g., john.doe@example.com"
                />
              </div>
            </div>
            
            {/* Phone */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient-form-phone" className="text-right">
                Phone
              </Label>
              <div className="col-span-3">
                <Input
                  id="patient-form-phone"
                  type="tel"
                  {...register("phone_number")}
                  placeholder="e.g., 555-1234"
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
                  isEditMode ? 'Save Changes' : 'Add Patient'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
