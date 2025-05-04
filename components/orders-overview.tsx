"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function OrdersOverview() {
  const [ordersData, setOrdersData] = useState<OrdersData>({
    monthlyData: [],
    stats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrdersData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/orders/overview');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders data');
        }
        
        const data = await response.json();
        setOrdersData(data);
      } catch (err) {
        console.error('Error fetching orders data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrdersData();
  }, []);

  // Define gradient backgrounds for each stat card
  const cardGradients = [
    "from-blue-50/20 via-transparent to-blue-50/20",
    "from-amber-50/20 via-transparent to-amber-50/20",
    "from-pink-50/20 via-transparent to-pink-50/20"
  ];

  return (
    <Card className="relative overflow-hidden col-span-full backdrop-blur-[1px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg font-semibold">Orders Overview</CardTitle>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full bg-yellow-500/20"></div>
            <span className="text-xs text-muted-foreground">Orders</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col space-y-4">
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-accent/50">
                  <div className="h-16 animate-pulse bg-accent/30 rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-[300px] w-full bg-accent/20 animate-pulse rounded-lg"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <p>{error}</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {ordersData.stats.map((stat, index) => (
                <div
                  key={index}
                  className={cn(
                    "group p-4 rounded-lg relative overflow-hidden transition-all duration-200",
                    "hover:shadow-md bg-gradient-to-br backdrop-blur-[2px]",
                    cardGradients[index % cardGradients.length]
                  )}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
            <div className="h-[300px] w-full p-2 bg-card/30 rounded-lg backdrop-blur-[1px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersData.monthlyData}>
                  <defs>
                    <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(234, 179, 8, 0.2)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgba(234, 179, 8, 0.1)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(234, 179, 8, 0.4)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="rgba(234, 179, 8, 0.2)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#374151" 
                    opacity={0.2} 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#EAB308' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="rgba(234, 179, 8, 0.6)"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={{ fill: '#EAB308', strokeWidth: 2 }}
                    activeDot={{ 
                      r: 6,
                      style: { fill: '#EAB308', filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.4))' }
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="rgba(234, 179, 8, 0.3)"
                    strokeWidth={2}
                    fill="url(#orderGradient)"
                    dot={{ fill: 'rgba(234, 179, 8, 0.5)', strokeWidth: 2 }}
                    activeDot={{ 
                      r: 6,
                      style: { fill: 'rgba(234, 179, 8, 0.5)', filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.2))' }
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
