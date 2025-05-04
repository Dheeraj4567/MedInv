'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  PieChart, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CategoryData {
  name: string;
  count: number;
  percentage: number;
  trend: number;
  value: number;
  color: string;
}

interface LocationData {
  name: string;
  count: number;
  percentage: number;
  trend: number;
  value: number;
  color: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categories: CategoryData[];
  locations: LocationData[];
}

interface InventoryDistributionProps {
  className?: string;
}

// Define a list of fixed colors to be assigned to categories and locations
const COLOR_PALETTE = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#8b5cf6", // purple-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#64748b", // slate-500
  "#84cc16", // lime-500
  "#6366f1"  // indigo-500
];

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

export function InventoryDistribution({ className }: InventoryDistributionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'category' | 'location'>('category');
  const [hoverState, setHoverState] = useState<string | null>(null);
  const [sortMethod, setSortMethod] = useState<'value' | 'percentage'>('value');
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  
  useEffect(() => {
    async function fetchInventoryData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data from your inventory API
        const response = await fetch('/api/inventory/distribution');
        
        if (!response.ok) {
          throw new Error(`Error fetching inventory data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Process the API data
        const processedData: InventoryStats = {
          totalItems: data.totalItems || 0,
          totalValue: data.totalValue || 0,
          lowStockCount: data.lowStockCount || 0,
          
          // Process category data and add colors
          categories: (data.categories || []).map((category: any, index: number) => ({
            name: category.name,
            count: category.count,
            percentage: category.percentage,
            trend: category.trend || 0,
            value: category.value || 0,
            color: COLOR_PALETTE[index % COLOR_PALETTE.length]
          })),
          
          // Process location data and add colors
          locations: (data.locations || []).map((location: any, index: number) => ({
            name: location.name,
            count: location.count,
            percentage: location.percentage,
            trend: location.trend || 0,
            value: location.value || 0,
            color: COLOR_PALETTE[index % COLOR_PALETTE.length]
          }))
        };
        
        setInventoryStats(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching inventory distribution data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    }

    fetchInventoryData();
  }, []);
  
  // Sort the active data based on selected sort method
  const getSortedData = () => {
    if (!inventoryStats) return [];
    
    const activeData = activeView === 'category' ? inventoryStats.categories : inventoryStats.locations;
    return [...activeData].sort((a, b) => 
      sortMethod === 'value' ? b.value - a.value : b.percentage - a.percentage
    );
  };
  
  // Function to generate pie chart segments using stroke-dasharray and stroke-dashoffset
  const generatePieChartSegments = (data: CategoryData[] | LocationData[]) => {
    if (!data || data.length === 0) return [];
    
    const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);
    const radius = 15.91549430918954; // For a circle with circumference of 100
    const circumference = 2 * Math.PI * radius;
    
    let accumulatedPercentage = 0;
    
    return sortedData.map((item, index) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = `${-((accumulatedPercentage / 100) * circumference)}`;
      accumulatedPercentage += item.percentage;
      
      return (
        <circle
          key={index}
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={item.color}
          strokeWidth="30"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      );
    });
  };

  // Handle sorting change
  const handleSortChange = (method: 'value' | 'percentage') => {
    setSortMethod(method);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card className={cn("border-border/40 shadow-sm", className)}>
        <CardHeader className="pb-2 pt-6 flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-6 w-44 bg-muted" />
            <Skeleton className="h-4 w-60 mt-2 bg-muted" />
          </div>
          <Skeleton className="h-8 w-28 bg-muted" />
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Left: Circular chart skeleton */}
            <div className="w-full md:w-1/3 flex justify-center">
              <Skeleton className="h-52 w-52 rounded-full bg-muted" />
            </div>
            
            {/* Right: Stats/Details skeleton */}
            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24 bg-muted" />
                <Skeleton className="h-5 w-32 bg-muted" />
              </div>
              
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-12 bg-muted" />
                  </div>
                  <Skeleton className="h-2 w-full bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-border/40 px-6 py-3">
          <Skeleton className="h-9 w-full bg-muted" />
        </CardFooter>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={cn("border-border/40 shadow-sm", className)}>
        <CardHeader className="pb-2 pt-6">
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Breakdown by categories and locations</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold">Failed to load inventory distribution</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-800 text-red-500 hover:bg-red-900/10"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle case where data is loaded but empty
  if (!inventoryStats || 
      (activeView === 'category' && (!inventoryStats.categories || inventoryStats.categories.length === 0)) ||
      (activeView === 'location' && (!inventoryStats.locations || inventoryStats.locations.length === 0))) {
    return (
      <Card className={cn("border-border/40 shadow-sm", className)}>
        <CardHeader className="pb-2 pt-6">
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Breakdown by categories and locations</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PieChart className="h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold">No data available</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-6">
              There is no {activeView === 'category' ? 'category' : 'location'} data to display
            </p>
            <Button 
              onClick={() => setActiveView(activeView === 'category' ? 'location' : 'category')}
              variant="outline"
            >
              View {activeView === 'category' ? 'Locations' : 'Categories'} Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Data for the current active view
  const activeData = getSortedData();
  const selectedData = activeView === 'category' ? inventoryStats.categories : inventoryStats.locations;
  
  return (
    <Card className={cn("border-border/40 shadow-sm", className)}>
      <CardHeader className="pb-2 pt-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Breakdown by categories and locations</CardDescription>
        </div>
        <Tabs 
          value={activeView} 
          onValueChange={(v) => setActiveView(v as 'category' | 'location')}
          className="h-8"
        >
          <TabsList className="h-8">
            <TabsTrigger value="category" className="h-7 px-3">
              Categories
            </TabsTrigger>
            <TabsTrigger value="location" className="h-7 px-3">
              Locations
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Left: Pie Chart */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Pie chart segments */}
                {generatePieChartSegments(selectedData)}
                
                {/* Center circle for donut effect */}
                <circle cx="50" cy="50" r="15" fill="hsl(var(--card))" />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{inventoryStats.totalItems.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
            </div>
            
            {/* Total Inventory Value */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold">{formatCurrency(inventoryStats.totalValue)}</p>
            </div>
          </div>
          
          {/* Right: Category/Location Breakdown */}
          <div className="w-full md:w-2/3">
            {/* Sorting buttons and title */}
            <div className="flex justify-between items-center mb-4"> {/* Ensure this div wraps both title and buttons */}
              <div> {/* Title div */}
                <h3 className="text-base font-medium">
                  Top {activeView === 'category' ? 'Categories' : 'Locations'} by {sortMethod === 'value' ? 'Value' : 'Percentage'}
                </h3>
              </div> {/* Close Title div */}
              {/* Sorting Buttons div */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSortChange('value')}
                  className={cn(
                    "text-xs px-2 py-1 rounded",
                    sortMethod === 'value' ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  By Value
                </button>
                <button
                  onClick={() => handleSortChange('percentage')}
                  className={cn(
                    "text-xs px-2 py-1 rounded",
                    sortMethod === 'percentage' ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  By %
                </button>
              </div> {/* Close Sorting Buttons div */}
            </div> {/* Close flex justify-between div */}

            {/* Item list */}
            <div className="space-y-3">
              {activeData.map((item, index) => (
                <div
                  key={item.name}
                  className="group"
                  onMouseEnter={() => setHoverState(item.name)}
                  onMouseLeave={() => setHoverState(null)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-sm">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.count.toLocaleString()} items
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          item.trend > 0 ? "bg-green-500/10 text-green-400 border-green-800" : 
                          item.trend < 0 ? "bg-red-500/10 text-red-400 border-red-800" : 
                          "bg-slate-500/10 text-slate-400 border-slate-800"
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {item.trend > 0 ? (
                            <TrendingUp size={12} />
                          ) : item.trend < 0 ? (
                            <TrendingDown size={12} />
                          ) : null}
                          {item.trend === 0 ? "0%" : `${item.trend > 0 ? '+' : ''}${item.trend}%`}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1.5">
                    {/* Progress bar */}
                    <div className="flex-grow h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                          opacity: hoverState === item.name || hoverState === null ? 1 : 0.4
                        }}
                      />
                    </div>
                    
                    {/* Percentage and value */}
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground w-8 text-right">
                        {item.percentage}%
                      </span>
                      {/* Use formatCurrency for item value */}
                      <span className="text-muted-foreground min-w-[70px] text-right">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Low Stock Indicator */}
            {activeView === 'category' && inventoryStats.lowStockCount > 0 && (
              <div className="mt-4 flex items-center justify-between p-2 bg-amber-500/10 rounded border border-amber-800/20">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} className="text-amber-500" />
                  <span className="text-xs font-medium text-amber-200">
                    {inventoryStats.lowStockCount} {inventoryStats.lowStockCount === 1 ? 'category has' : 'categories have'} items below restock threshold
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                  onClick={() => router.push('/inventory?filter=low-stock')}
                >
                  View Details
                </Button>
              </div>
            )}
          </div> {/* Close Right column div */}
        </div> {/* Close flex container div */}
      </CardContent>
      
      <CardFooter className="border-t border-border/40 px-6 py-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => router.push(`/${activeView === 'category' ? 'drug-categories' : 'inventory'}?view=distribution`)}
        >
          {activeView === 'category' 
            ? 'View Detailed Category Breakdown'
            : 'View Storage Locations Report'
          }
        </Button>
      </CardFooter>
    </Card>
  );
}