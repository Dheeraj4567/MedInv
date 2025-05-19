"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AppLayout } from "@/components/app-layout";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import { OrderForm } from '@/components/order-form';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Order {
  order_id: number;
  patient_id: number;
  medicine_id: number;
  patient_name: string;
  medicine_name: string;
  quantity?: number;
  order_date: string;
  log_date: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Small delay to ensure database operation has completed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch('/api/orders', {
        // Add cache busting to prevent stale data
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleAddOrder = () => {
    setActionError(null);
    setCurrentOrder(null);
    setIsFormOpen(true);
  };

  const handleEditOrder = (orderId: number) => {
    setActionError(null);
    const orderToEdit = orders.find(order => order.order_id === orderId);
    if (orderToEdit) {
      setCurrentOrder(orderToEdit);
      setIsFormOpen(true);
    }
  };

  const handleDeleteOrderClick = (orderId: number) => {
    setDeleteOrderId(orderId);
  };

  const handleConfirmDelete = async () => {
    if (deleteOrderId) {
      await handleDeleteOrder(deleteOrderId);
      setDeleteOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    setActionError(null);
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        setActionError(errorData.error || 'Failed to delete order.');
        return;
      }
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
      setActionError(err instanceof Error ? err.message : 'An unexpected error occurred during deletion.');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setCurrentOrder(null);
    fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    if (!debouncedSearchTerm) return orders;
    const lower = debouncedSearchTerm.toLowerCase();
    return orders.filter(order =>
      order.patient_name?.toLowerCase().includes(lower) ||
      order.medicine_name?.toLowerCase().includes(lower) ||
      String(order.order_id).includes(lower)
    );
  }, [orders, debouncedSearchTerm]);

  return (
    <AppLayout>
      <DashboardShell>
        <DashboardHeader heading="Orders" text="View and manage customer orders." />
        
        {actionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Order List</CardTitle>
            <div className="flex items-center space-x-2">
               <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search ID, patient, or medicine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px] md:w-[300px]"
                  />
               </div>
               <Button size="sm" onClick={handleAddOrder}>
                 <PlusCircle className="h-4 w-4 mr-2" />
                 Add Order
               </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-600">
                <p>Error loading orders: {error}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead className="text-right w-[100px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody className="table-row-hover">
                   {filteredOrders.length > 0 ? (
                     filteredOrders.map((order, index) => (
                      <TableRow key={`${order.order_id}-${order.medicine_name}-${index}`}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{formatDate(order.order_date)}</TableCell>
                        <TableCell>{order.patient_name}</TableCell>
                        <TableCell>{order.medicine_name}</TableCell>
                        <TableCell className="text-right">{order.quantity || 1}</TableCell>
                        <TableCell className="space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOrder(order.order_id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700" 
                            onClick={() => handleDeleteOrderClick(order.order_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {debouncedSearchTerm ? 'No orders match your search.' : 'No orders found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <OrderForm 
          order={currentOrder}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
        />

        <AlertDialog open={deleteOrderId !== null} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardShell>
    </AppLayout>
  );
}
