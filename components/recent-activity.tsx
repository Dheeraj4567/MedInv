"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Boxes, 
  CalendarClock, 
  Truck, 
  Info, 
  RefreshCcw, 
  Filter,
  Users,
  Pill,
  Receipt,
  MoreHorizontal,
  type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Activity {
  id: number;
  type: string;
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  itemId?: string;
  status?: string;
}

export function RecentActivity() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecentActivity = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Fetch activity data from the API
      const response = await fetch('/api/recent-activity', { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.status}`);
      }
        
      const data = await response.json();
      
      // Format the activities with proper fields - removed user_name field
      const formattedActivities = data.map((item: any) => ({
        id: item.id,
        type: item.type || 'info',
        action: item.action || 'Activity',
        details: item.details || '',
        timestamp: item.timestamp,
        itemId: item.itemId || item.item_id,
        status: item.status || 'completed'
      }));
      
      setActivities(formattedActivities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  const getIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'inventory': return Boxes;
      case 'expiry': return CalendarClock;
      case 'supplier': return Truck;
      case 'medicine': return Pill;
      case 'patient': return Users;
      case 'billing': return Receipt;
      default: return Info;
    }
  };

  const getIconBg = (type: string, status?: string): string => {
    if (status === 'warning') return 'bg-amber-500/10 text-amber-500';
    if (status === 'error') return 'bg-red-500/10 text-red-500';
    
    switch (type) {
      case 'order': return 'bg-blue-500/10 text-blue-500';
      case 'inventory': return 'bg-green-500/10 text-green-500';
      case 'expiry': return 'bg-red-500/10 text-red-500';
      case 'supplier': return 'bg-yellow-500/10 text-yellow-500';
      case 'medicine': return 'bg-purple-500/10 text-purple-500';
      case 'patient': return 'bg-cyan-500/10 text-cyan-500';
      case 'billing': return 'bg-indigo-500/10 text-indigo-500';
      default: return 'bg-accent/20 text-primary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });
  
  const handleActivityClick = (activity: Activity) => {
    // Navigate based on activity type or directly to activity logs
    router.push('/activity-logs');
  };

  const renderActivityContent = (isLoading: boolean, error: string | null, activities: Activity[]) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-6 text-red-500">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => fetchRecentActivity()}
          >
            Try Again
          </Button>
        </div>
      );
    }
    
    if (activities.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>No activity found</p>
        </div>
      );
    }
    
    return (
      <div className="relative pr-2">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          const isLast = index === activities.length - 1;
          
          return (
            <div key={activity.id} className="flex gap-3 pb-6 last:pb-0 relative group">
              {/* Vertical Line */}
              {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border/40" />
              )}
              
              {/* Icon Bubble */}
              <div className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card shadow-sm transition-colors group-hover:border-primary/30",
                // Use text color for icon, border is default
                activity.type === 'order' && "text-blue-500",
                activity.type === 'inventory' && "text-emerald-500",
                activity.type === 'expiry' && "text-red-500",
                activity.type === 'supplier' && "text-amber-500",
                activity.type === 'medicine' && "text-purple-500",
                activity.type === 'patient' && "text-cyan-500",
                activity.type === 'billing' && "text-indigo-500",
                activity.type === 'info' && "text-slate-500"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium leading-none truncate text-foreground/90 group-hover:text-primary transition-colors">
                    {activity.action}
                  </p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {activity.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          Recent Activity
          <span className="ml-2 text-xs text-muted-foreground">
            Last 24 hours
          </span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => fetchRecentActivity()}
            disabled={isRefreshing}
          >
            <RefreshCcw 
              size={16} 
              className={cn(
                "text-muted-foreground",
                isRefreshing && "animate-spin"
              )} 
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        <div className="px-4">
          <TabsList className="grid grid-cols-4 h-8 w-full">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="order" className="text-xs">Orders</TabsTrigger>
            <TabsTrigger value="expiry" className="text-xs">Expiry</TabsTrigger>
          </TabsList>
        </div>
      
        <CardContent className="pt-4">
          <TabsContent value="all" className="m-0">
            {renderActivityContent(isLoading, error, filteredActivities)}
          </TabsContent>
          <TabsContent value="inventory" className="m-0">
            {renderActivityContent(isLoading, error, filteredActivities)}
          </TabsContent>
          <TabsContent value="order" className="m-0">
            {renderActivityContent(isLoading, error, filteredActivities)}
          </TabsContent>
          <TabsContent value="expiry" className="m-0">
            {renderActivityContent(isLoading, error, filteredActivities)}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t border-border/30 px-6 py-3 flex justify-center">
        <Button 
          variant="link" 
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1" 
          onClick={() => router.push('/activity-logs')}
        >
          View All Activity
          <motion.div 
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
          >
            <MoreHorizontal size={16} />
          </motion.div>
        </Button>
      </CardFooter>
    </Card>
  );
  

}
