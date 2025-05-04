"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from "@/components/app-layout";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUp, ArrowDown } from "lucide-react";

// Interfaces
interface OrderStat {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
}
interface MonthlyData {
  name: string;
  orders: number;
  revenue: number;
}
interface OrdersData {
  monthlyData: MonthlyData[];
  stats: OrderStat[];
}
interface TopMedicineData {
  name: string;
  total_quantity_sold: number;
}
interface MonthlyQuantitySold {
  month: string;
  total_quantity_sold: number;
}

const COLORS = ['#EAB308', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'];

export default function AnalyticsPage() {
  const [ordersOverviewData, setOrdersOverviewData] = useState<OrdersData | null>(null);
  const [topMedicines, setTopMedicines] = useState<TopMedicineData[]>([]);
  const [monthlyQuantitySold, setMonthlyQuantitySold] = useState<MonthlyQuantitySold[]>([]); // State for monthly sales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch orders overview data
      const overviewResponse = await fetch('/api/orders/overview');
      if (!overviewResponse.ok) throw new Error('Failed to fetch orders overview data');
      const overviewData = await overviewResponse.json();
      setOrdersOverviewData(overviewData);

      // Fetch top selling medicines data
      const topMedResponse = await fetch('/api/analytics/top-medicines');
      if (!topMedResponse.ok) throw new Error('Failed to fetch top selling medicines');
      const topMedData = await topMedResponse.json();
      setTopMedicines(topMedData);

      // Fetch monthly quantity sold data
      const monthlySalesResponse = await fetch('/api/analytics/inventory-turnover'); // Endpoint name is a bit misleading now
      if (!monthlySalesResponse.ok) throw new Error('Failed to fetch monthly sales data');
      const monthlySalesData = await monthlySalesResponse.json();
      setMonthlyQuantitySold(monthlySalesData);

    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setOrdersOverviewData(null);
      setTopMedicines([]);
      setMonthlyQuantitySold([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return (
    <AppLayout>
      <DashboardShell>
        <DashboardHeader heading="Analytics" text="Insights into inventory and sales performance." />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-600">
            <p>Error loading data: {error}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Order Stats Cards */}
            {ordersOverviewData?.stats.map((stat, index) => (
              <Card key={`stat-${index}`} className="stat-card-gradient">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                   <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                       {stat.trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                       {stat.change}
                     </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}

             {/* Monthly Orders/Revenue Chart */}
             {ordersOverviewData && ordersOverviewData.monthlyData.length > 0 && (
                <Card className="col-span-full lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Monthly Orders & Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                     <ResponsiveContainer width="100%" height={300}>
                       <AreaChart data={ordersOverviewData.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="anaOrderGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                           <linearGradient id="anaRevenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4}/><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/></linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false}/>
                         <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                         <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} dx={-10}/>
                         <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} itemStyle={{ color: 'hsl(var(--primary))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }}/>
                         <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#anaRevenueGradient)" name="Revenue"/>
                         <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#anaOrderGradient)" name="Orders"/>
                       </AreaChart>
                     </ResponsiveContainer>
                  </CardContent>
                </Card>
             )}

             {/* Top Selling Medicines Pie Chart */}
             <Card>
                <CardHeader>
                    <CardTitle>Top Selling Medicines (by Quantity)</CardTitle>
                </CardHeader>
                <CardContent>
                    {topMedicines.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={topMedicines}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="total_quantity_sold"
                                    nameKey="name"
                                >
                                    {topMedicines.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} units`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="flex items-center justify-center h-[300px]">
                            <p className="text-muted-foreground">No sales data available.</p>
                         </div>
                    )}
                </CardContent>
             </Card>

             {/* Monthly Quantity Sold Bar Chart */}
             <Card>
                <CardHeader>
                    <CardTitle>Monthly Quantity Sold</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                     {monthlyQuantitySold.length > 0 ? (
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyQuantitySold} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false}/>
                            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} dx={-10}/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} itemStyle={{ color: 'hsl(var(--primary))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }}/>
                            <Bar dataKey="total_quantity_sold" fill="hsl(var(--primary))" name="Quantity Sold" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                     ) : (
                         <div className="flex items-center justify-center h-[300px]">
                            <p className="text-muted-foreground">No monthly sales data available.</p>
                         </div>
                     )}
                </CardContent>
             </Card>

          </div>
        )}
      </DashboardShell>
    </AppLayout>
  );
}
