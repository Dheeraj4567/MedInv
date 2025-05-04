import { BaseModel } from './base-model';

export interface OrderStat {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
}

export interface MonthlyData {
  name: string;
  orders: number;
  revenue: number;
}

export interface OrdersData {
  monthlyData: MonthlyData[];
  stats: OrderStat[];
}

export interface TopMedicineData {
  medicine_id: number;
  name: string;
  total_quantity_sold: number;
  revenue_generated?: number;
}

export interface MonthlyQuantitySold {
  month: string;
  total_quantity_sold: number;
}

export interface DashboardStats {
  totalInventory: number;
  expiringItems: number;
  pendingOrders: number;
  activeSuppliers: number;
  changePercent?: {
    totalInventory: number;
    expiringItems: number;
    pendingOrders: number;
    activeSuppliers: number;
  };
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface FinancialData {
  revenue: number[];
  expenses: number[];
  profit: number[];
  labels: string[];
}

export interface RecentActivity {
  id: number;
  type: 'order' | 'inventory' | 'medicine' | 'supplier' | 'prescription';
  title: string;
  details: string;
  time: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
}