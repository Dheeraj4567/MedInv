'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock, ShoppingCart, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

// Interface matching the API response from /api/dashboard/inventory-summary
interface InventorySummaryStats {
  total_items: number;
  total_value: number;
  low_stock_count: number;
  expiring_soon_count: number;
  total_items_change_percentage?: number; // Added optional field for percentage change
}

export function InventorySummary() {
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<InventorySummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventorySummary() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard/inventory-summary');
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory summary: ${response.statusText}`);
        }
        const data: InventorySummaryStats = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching inventory summary:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventorySummary();
  }, [pathname]);

  // Helper function to format currency using Rupee symbol
  const formatCurrency = (value: number) => {
    // Using 'en-IN' locale should automatically use the Rupee symbol ₹
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      minimumFractionDigits: 0, // Optional: remove decimals if not needed
      maximumFractionDigits: 0  // Optional: remove decimals if not needed
    }).format(value);
  };

  // Render skeleton loading state
  if (isLoading) {
    return (
      <div className="bg-card border border-border/40 p-6 rounded-lg space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-48 bg-muted" />
          <Skeleton className="h-4 w-64 bg-muted" />
        </div>

        {/* Total Items Skeleton */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <Skeleton className="h-4 w-28 bg-muted mb-2" />
          <Skeleton className="h-8 w-32 bg-muted mb-1" />
          <Skeleton className="h-4 w-40 bg-muted" /> {/* Skeleton for percentage change */}
        </div>

        {/* Total Value */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <Skeleton className="h-4 w-28 bg-muted mb-2" />
          <Skeleton className="h-8 w-40 bg-muted" />
        </div>

        {/* Low Stock */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <Skeleton className="h-4 w-28 bg-muted mb-2" />
          <Skeleton className="h-8 w-20 bg-muted" />
        </div>

        {/* Expiring Soon */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <Skeleton className="h-4 w-28 bg-muted mb-2" />
          <Skeleton className="h-8 w-20 bg-muted" />
        </div>

        <Skeleton className="h-10 w-full bg-muted" />
      </div>
    );
  }

  // Display error message
  if (error) {
    return (
      <div className="bg-card border border-border/40 p-6 rounded-lg">
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold">Inventory Summary</h2>
          <p className="text-sm text-muted-foreground">Overview of current inventory</p>
        </div>
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load summary:</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
         <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
      </div>
    );
  }

  const percentageChange = stats?.total_items_change_percentage;
  const hasPercentageChange = typeof percentageChange === 'number';

  return (
    <div className="bg-card border border-border/40 p-6 rounded-lg space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Inventory Summary</h2>
        <p className="text-sm text-muted-foreground">Overview of current inventory</p>
      </div>
      
      {/* Total Items */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Total Items</div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats?.total_items?.toLocaleString() ?? '0'}</div>
          <Package size={20} className="text-blue-500" />
        </div>
        {/* Percentage Change Display */}
        {hasPercentageChange && (
          <div className={cn(
            "text-xs text-muted-foreground flex items-center mt-1",
            percentageChange > 0 ? "text-green-500" : percentageChange < 0 ? "text-red-500" : ""
          )}>
            {percentageChange > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : percentageChange < 0 ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {percentageChange > 0 ? '+' : ''}{percentageChange?.toFixed(0)}% from last month
          </div>
        )}
      </div>

      {/* Total Value */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Total Value</div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{formatCurrency(stats?.total_value ?? 0)}</div>
          {/* Placeholder for value icon if needed */}
        </div>
      </div>
      
      {/* Low Stock */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Low Stock Items</div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats?.low_stock_count?.toLocaleString() ?? '0'}</div>
          <ShoppingCart size={20} className="text-red-500" />
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">Expiring Soon (30d)</div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{stats?.expiring_soon_count?.toLocaleString() ?? '0'}</div>
          <Clock size={20} className="text-amber-500" />
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => router.push('/inventory')}
      >
        View Full Inventory Report
      </Button>
    </div>
  );
}
