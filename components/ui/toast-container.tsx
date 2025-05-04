"use client"

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast 
          key={id} 
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          onOpenChange={(open) => {
            if (!open) dismiss(id);
          }}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export default ToastContainer;