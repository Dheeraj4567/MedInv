"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AppLayout } from "@/components/app-layout";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryForm } from '@/components/inventory-form';
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Edit, Trash2, Search, PlusCircle, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { DataTable } from '@/components/data-table';

interface InventoryItem {
  inventory_number: number;
  medicine_id: number;
  supplier_id: number;
  medicine_name: string;
  supplier_name: string;
  quantity: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchInventory = useCallback(async () => {
    setActionError(null);
    setFetchError(null);
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.statusText}`);
      }
      const data = await response.json();
      setInventory(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setFetchError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchInventory();
  }, [fetchInventory]);

  const handleDelete = async (inventoryNumber: number) => {
    setActionError(null);
    try {
      const response = await fetch(`/api/inventory?inventory_number=${inventoryNumber}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setActionError(errorData.error || 'Cannot delete: Item is referenced elsewhere (e.g., Expiry Alerts).');
        } else {
          setActionError(errorData.error || 'Failed to delete item.');
        }
        return;
      }
      fetchInventory();
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      setActionError(err instanceof Error ? err.message : 'An unexpected error occurred during deletion.');
    }
  };

  const handleOpenForm = (item: InventoryItem | null = null) => {
    setActionError(null);
    if (item && (item.medicine_id === undefined || item.supplier_id === undefined)) {
      console.error("Missing medicine_id or supplier_id for editing item:", item);
      setActionError("Cannot edit item: missing required ID data.");
      return;
    }
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setCurrentItem(null);
    fetchInventory();
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'inventory_number',
      header: 'Inv. No.',
    },
    {
      accessorKey: 'medicine_name',
      header: 'Medicine Name',
    },
    {
      accessorKey: 'supplier_name',
      header: 'Supplier Name',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ getValue }) => <div className="text-right">{getValue()}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleOpenForm(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the inventory record for {row.original.medicine_name || 'this item'}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original.inventory_number)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ], [handleOpenForm, handleDelete]);

  const filteredInventory = useMemo(() => {
    if (!debouncedSearchTerm) return inventory;
    const lower = debouncedSearchTerm.toLowerCase();
    return inventory.filter(item =>
      item.medicine_name?.toLowerCase().includes(lower) ||
      item.supplier_name?.toLowerCase().includes(lower)
    );
  }, [inventory, debouncedSearchTerm]);

  return (
    <AppLayout>
      <DashboardShell>
        <DashboardHeader heading="Inventory" text="View and manage current stock levels." />

        {actionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-lg font-semibold">Current Inventory</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search medicine or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px] md:w-[300px]"
                />
              </div>
              <Button size="sm" onClick={() => handleOpenForm(null)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading inventory...</p>
              </div>
            ) : fetchError ? (
              <div className="flex justify-center items-center h-64 text-red-600">
                <p>Error loading inventory: {fetchError}</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredInventory}
                searchKey="medicine or supplier"
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
        <InventoryForm
          item={currentItem}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
        />
      </DashboardShell>
    </AppLayout>
  );
}
