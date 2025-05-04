"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define form schema with validation
const formSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  medicine_id: z.string().min(1, "Medicine is required"),
  quantity: z.string().min(1, "Quantity is required").transform(val => parseInt(val)),
});

interface Patient {
  patient_id: number;
  name: string;
}

interface Medicine {
  medicine_id: number;
  medicine_name: string;
  in_stock: number; // Available quantity
}

interface Order {
  order_id: number;
  patient_id: number;
  patient_name: string;
  medicine_name: string;
  medicine_id: number;
  quantity?: number;
  order_date: string;
  log_date: string;
}

interface OrderFormProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OrderForm({ order, isOpen, onOpenChange, onSuccess }: OrderFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configure form with default values and validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: order?.patient_id?.toString() || "",
      medicine_id: order?.medicine_id?.toString() || "",
      quantity: order?.quantity?.toString() || "1",
    },
  });

  // Reset form when order changes (edit versus add mode)
  useEffect(() => {
    if (isOpen) {
      form.reset({
        patient_id: order?.patient_id?.toString() || "",
        medicine_id: order?.medicine_id?.toString() || "",
        quantity: order?.quantity?.toString() || "1",
      });
    }
  }, [form, isOpen, order]);

  // Fetch patients and medicines when form is opened
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch patients
        const patientsResponse = await fetch('/api/patients');
        if (!patientsResponse.ok) throw new Error('Failed to load patients');
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);

        // Fetch medicines
        const medicinesResponse = await fetch('/api/medicines');
        if (!medicinesResponse.ok) throw new Error('Failed to load medicines');
        const medicinesData = await medicinesResponse.json();
        setMedicines(medicinesData);
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const apiUrl = '/api/orders' + (order ? `?id=${order.order_id}` : '');
      const method = order ? 'PUT' : 'POST';
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${order ? 'update' : 'create'} order`);
      }
      
      onSuccess();
    } catch (err) {
      console.error(`Error ${order ? 'updating' : 'creating'} order:`, err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{order ? 'Edit' : 'Add'} Order</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select 
                    disabled={isLoading} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem 
                          key={patient.patient_id} 
                          value={patient.patient_id.toString()}
                        >
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medicine_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine</FormLabel>
                  <Select 
                    disabled={isLoading} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medicine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medicines.map((medicine) => (
                        <SelectItem 
                          key={medicine.medicine_id} 
                          value={medicine.medicine_id.toString()}
                        >
                          {medicine.medicine_name} ({medicine.in_stock} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {order ? 'Update' : 'Add'} Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}