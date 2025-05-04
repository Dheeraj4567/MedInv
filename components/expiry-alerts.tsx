"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, AlertTriangle, ArrowRight, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExpiryAlert {
  id: number;
  medicine: string;
  batch: string;
  expiryDate: string;
  daysLeft: number;
  quantity: number;
  manufacturer?: string;
  location?: string;
  category?: string;
}

interface ExpiryAlertsProps {
  extended?: boolean;
}

export function ExpiryAlerts({ extended = false }: ExpiryAlertsProps) {
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "normal">("all");

  useEffect(() => {
    async function fetchExpiryAlerts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/expiry-alerts');
        if (!response.ok) {
          throw new Error(`Failed to fetch expiry alerts: ${response.statusText}`);
        }
        const data = await response.json();
        
        setAlerts(data);

      } catch (err) {
        console.error('Error fetching expiry alerts:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpiryAlerts();
  }, [extended]);

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 15) return "text-red-500 bg-red-500/10";
    if (daysLeft <= 30) return "text-yellow-500 bg-yellow-500/10";
    return "text-green-500 bg-green-500/10";
  };

  const getUrgencyText = (daysLeft: number) => {
    if (daysLeft <= 15) return "Critical";
    if (daysLeft <= 30) return "Warning";
    return "Normal";
  };

  const getProgressWidth = (daysLeft: number) => {
    if (daysLeft <= 15) return "w-[25%]";
    if (daysLeft <= 30) return "w-[50%]";
    return "w-[75%]";
  };

  const getFilteredAlerts = () => {
    if (filter === "all") return alerts;
    if (filter === "critical") return alerts.filter(a => a.daysLeft <= 15);
    if (filter === "warning") return alerts.filter(a => a.daysLeft > 15 && a.daysLeft <= 30);
    return alerts.filter(a => a.daysLeft > 30);
  };

  const filteredAlerts = getFilteredAlerts();
  
  const renderCardContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-6">
          <div className="animate-pulse text-muted-foreground">Loading expiry data...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-6 text-red-500">
          <p>{error}</p>
          <p className="text-sm mt-2">Please try again later</p>
        </div>
      );
    }
    
    if (filteredAlerts.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>No {filter !== "all" ? filter : ""} expiry alerts found</p>
        </div>
      );
    }
    
    return extended ? renderExtendedAlerts() : renderCompactAlerts();
  };

  const renderCompactAlerts = () => (
    <div className="space-y-4">
      {filteredAlerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="group flex flex-col rounded-lg p-4 transition-all hover:bg-accent/50 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={cn("px-2 py-1 rounded-full text-xs flex items-center", getUrgencyColor(alert.daysLeft))}>
                <CalendarClock className="h-3 w-3 mr-1" />
                <span>{getUrgencyText(alert.daysLeft)}</span>
              </div>
              <span className="text-xs text-muted-foreground">{alert.batch}</span>
            </div>
            <div className="text-sm font-medium">
              {alert.daysLeft} days left
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">{alert.medicine}</h4>
            <span className="text-xs text-muted-foreground">Qty: {alert.quantity}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-accent/30 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300",
                alert.daysLeft <= 15 ? "bg-red-500" : 
                alert.daysLeft <= 30 ? "bg-yellow-500" : "bg-green-500",
                getProgressWidth(alert.daysLeft)
              )}
            />
          </div>

          {/* Subtle hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      ))}
      
      {alerts.length > 3 && (
        <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
          View all {alerts.length} alerts <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );

  const renderExtendedAlerts = () => (
    <div className="space-y-0">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 pb-4">
        <Badge 
          variant={filter === "all" ? "default" : "outline"} 
          className="cursor-pointer hover:bg-accent/50"
          onClick={() => setFilter("all")}
        >
          All ({alerts.length})
        </Badge>
        <Badge 
          variant={filter === "critical" ? "destructive" : "outline"} 
          className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
          onClick={() => setFilter("critical")}
        >
          Critical ({alerts.filter(a => a.daysLeft <= 15).length})
        </Badge>
        <Badge 
          variant={filter === "warning" ? "default" : "outline"} 
          className={cn(
            "cursor-pointer",
            filter === "warning" 
              ? "bg-yellow-500 hover:bg-yellow-600" 
              : "hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
          )}
          onClick={() => setFilter("warning")}
        >
          Warning ({alerts.filter(a => a.daysLeft > 15 && a.daysLeft <= 30).length})
        </Badge>
        <Badge 
          variant={filter === "normal" ? "default" : "outline"} 
          className={cn(
            "cursor-pointer",
            filter === "normal" 
              ? "bg-green-500 hover:bg-green-600" 
              : "hover:bg-green-100 dark:hover:bg-green-900/20"
          )}
          onClick={() => setFilter("normal")}
        >
          Normal ({alerts.filter(a => a.daysLeft > 30).length})
        </Badge>
      </div>
    
      <div className="divide-y divide-border/40">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="group flex flex-wrap md:flex-nowrap gap-4 py-4 transition-all hover:bg-accent/50"
          >
            {/* Status indicator */}
            <div className="flex flex-col items-center justify-center w-full md:w-auto">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                alert.daysLeft <= 15 ? "bg-red-500/20 text-red-500" : 
                alert.daysLeft <= 30 ? "bg-yellow-500/20 text-yellow-500" : 
                "bg-green-500/20 text-green-500"
              )}>
                <CalendarClock className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium mt-1">{alert.daysLeft} days</div>
            </div>
            
            {/* Medicine details */}
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h4 className="text-base font-medium flex items-center">
                  <Pill className="h-4 w-4 mr-2 inline" />
                  {alert.medicine}
                </h4>
                <div className={cn(
                  "ml-2 px-2 py-0.5 rounded-full text-xs",
                  getUrgencyColor(alert.daysLeft)
                )}>
                  {getUrgencyText(alert.daysLeft)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Batch</div>
                  <div>{alert.batch}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Expiry</div>
                  <div>{new Date(alert.expiryDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Quantity</div>
                  <div>{alert.quantity} units</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Location</div>
                  <div>{alert.location || "—"}</div>
                </div>
              </div>
              
              {alert.manufacturer && (
                <div className="mt-3 text-xs text-muted-foreground flex items-center flex-wrap gap-2">
                  <span>Manufacturer: <span className="font-medium text-foreground">{alert.manufacturer}</span></span>
                  {alert.category && (
                    <>
                      <span className="size-1 rounded-full bg-muted-foreground/50"></span>
                      <span>Category: <span className="font-medium text-foreground">{alert.category}</span></span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="w-full md:w-auto flex md:flex-col gap-2 items-end justify-end">
              <Button size="sm" variant="outline">View Details</Button>
              <Button size="sm" variant="default">Take Action</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className={cn("relative overflow-hidden", extended ? "shadow-sm" : "")}>
      {!extended && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Expiry Alerts</CardTitle>
          {!isLoading && !error && alerts.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>{alerts.filter(a => a.daysLeft <= 15).length} Critical</span>
              </div>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={extended ? "p-6" : ""}>
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}
