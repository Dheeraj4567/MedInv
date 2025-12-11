'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { 
  Package, Pill, ShoppingCart, Users, FileText,
  Receipt, Database, FileBarChart2, Filter, Search,
  ChevronRight, LayoutGrid, ClipboardList, BarChart3,
  Building2, CheckCircle2, FileSearch, Truck, UserPlus, X,
  Download, RotateCw, Upload, Activity, BadgeAlert, MessageSquare,
  Plus, Calendar, ArrowRightLeft, Tag, FileEdit, UserCircle,
  CreditCard, CircleDollarSign, FileCheck
} from 'lucide-react';

// Category interface
interface DatabaseCategory {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  tables: number;
}

// Table interface
interface DatabaseTable {
  name: string;
  count?: number;
  lastUpdated?: string;
  category: 'inventory' | 'orders' | 'patients' | 'operations' | 'system' | 'finance';
  icon: React.ElementType;
  color: string;
}

// Operation interface
interface DatabaseOperation {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path?: string;
  color: string;
  bgColor: string;
  category: 'create' | 'read' | 'update' | 'delete' | 'analytics' | 'system';
  action?: () => void;
  badge?: string;
  badgeColor?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
  disabled?: boolean;
  featured?: boolean;
}

// Define database categories
const databaseCategories: DatabaseCategory[] = [
  { 
    name: 'Inventory', 
    icon: Package, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    description: 'Medicine and stock management',
    tables: 4
  },
  { 
    name: 'Orders', 
    icon: ShoppingCart, 
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    description: 'Purchase orders and supply chain',
    tables: 4
  },
  { 
    name: 'Patients', 
    icon: Users, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    description: 'Patient records and prescriptions',
    tables: 3
  },
  { 
    name: 'Finance', 
    icon: Receipt, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    description: 'Billing and financial records',
    tables: 4
  },
  { 
    name: 'Operations', 
    icon: ClipboardList, 
    color: 'text-rose-600',
    bgColor: 'bg-rose-600/10',
    description: 'Staff and operational data',
    tables: 3
  },
  { 
    name: 'System', 
    icon: Database, 
    color: 'text-slate-600',
    bgColor: 'bg-slate-600/10',
    description: 'System tables and logs',
    tables: 3
  }
];

// Database tables with metadata
const databaseTables: DatabaseTable[] = [
  { name: "Medicine", count: 145, lastUpdated: "10m ago", category: 'inventory', icon: Pill, color: 'text-blue-600' },
  { name: "Inventory", count: 327, lastUpdated: "25m ago", category: 'inventory', icon: Package, color: 'text-blue-600' },
  { name: "DrugCategory", count: 38, lastUpdated: "2d ago", category: 'inventory', icon: Database, color: 'text-blue-600' },
  { name: "InventoryBatch", count: 856, lastUpdated: "32m ago", category: 'inventory', icon: Package, color: 'text-blue-600' },
  
  { name: "Orders", count: 982, lastUpdated: "5m ago", category: 'orders', icon: ShoppingCart, color: 'text-green-600' },
  { name: "OrderItems", count: 2341, lastUpdated: "5m ago", category: 'orders', icon: ClipboardList, color: 'text-green-600' },
  { name: "OrderLogs", count: 574, lastUpdated: "30m ago", category: 'orders', icon: FileSearch, color: 'text-green-600' },
  { name: "Supplier", count: 48, lastUpdated: "2h ago", category: 'orders', icon: Truck, color: 'text-green-600' },
  
  { name: "Patient", count: 1254, lastUpdated: "1h ago", category: 'patients', icon: Users, color: 'text-amber-600' },
  { name: "Prescription", count: 856, lastUpdated: "32m ago", category: 'patients', icon: FileText, color: 'text-amber-600' },
  { name: "PrescriptionDetails", count: 2104, lastUpdated: "1h ago", category: 'patients', icon: FileText, color: 'text-amber-600' },
  
  { name: "Billing", count: 327, lastUpdated: "25m ago", category: 'finance', icon: Receipt, color: 'text-purple-600' },
  { name: "BillingDetails", count: 58, lastUpdated: "15m ago", category: 'finance', icon: Receipt, color: 'text-purple-600' },
  { name: "BillLogs", count: 126, lastUpdated: "20m ago", category: 'finance', icon: FileSearch, color: 'text-purple-600' },
  { name: "Discount", count: 42, lastUpdated: "3h ago", category: 'finance', icon: Receipt, color: 'text-purple-600' },
  
  { name: "Employee", count: 124, lastUpdated: "1d ago", category: 'operations', icon: UserPlus, color: 'text-rose-600' },
  { name: "StaffAccount", count: 73, lastUpdated: "5h ago", category: 'operations', icon: Users, color: 'text-rose-600' },
  
  { name: "ActivityLog", count: 145, lastUpdated: "10m ago", category: 'system', icon: Activity, color: 'text-slate-600' },
  { name: "ExpiryAlert", count: 27, lastUpdated: "10m ago", category: 'system', icon: BadgeAlert, color: 'text-slate-600' },
  { name: "Feedback", count: 89, lastUpdated: "4h ago", category: 'system', icon: MessageSquare, color: 'text-slate-600' },
];

// Enhanced create operations with more options
const createOperations: DatabaseOperation[] = [
  {
    id: 'add-medicine',
    title: 'Add Medicine',
    description: 'Create a new medicine entry',
    icon: Pill,
    path: '/medicines/add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'create',
    featured: true
  },
  {
    id: 'add-inventory',
    title: 'Add Inventory',
    description: 'Add new inventory stock',
    icon: Package,
    path: '/inventory/add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'create',
    featured: true
  },
  {
    id: 'add-category',
    title: 'Add Drug Category',
    description: 'Create new medicine category',
    icon: Tag,
    path: '/drug-categories/add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'create'
  },
  {
    id: 'add-order',
    title: 'New Order',
    description: 'Create purchase order',
    icon: ShoppingCart,
    path: '/orders/add',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    category: 'create',
    featured: true
  },
  {
    id: 'add-supplier',
    title: 'Add Supplier',
    description: 'Register new supplier',
    icon: Truck,
    path: '/suppliers/add',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    category: 'create'
  },
  {
    id: 'add-patient',
    title: 'Add Patient',
    description: 'Register new patient',
    icon: UserCircle,
    path: '/patients/add',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    category: 'create',
    featured: true
  },
  {
    id: 'add-prescription',
    title: 'New Prescription',
    description: 'Create patient prescription',
    icon: FileText,
    path: '/prescriptions/add',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    category: 'create'
  },
  {
    id: 'add-billing',
    title: 'New Invoice',
    description: 'Create billing invoice',
    icon: Receipt,
    path: '/billing/add',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    category: 'create',
    featured: true
  },
  {
    id: 'add-payment',
    title: 'Record Payment',
    description: 'Record a payment transaction',
    icon: CreditCard,
    path: '/billing/payment/add',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    category: 'create'
  },
  {
    id: 'add-discount',
    title: 'Create Discount',
    description: 'Add new discount rule',
    icon: CircleDollarSign,
    path: '/discounts/add',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    category: 'create'
  },
  {
    id: 'add-staff',
    title: 'Add Staff Member',
    description: 'Register new staff account',
    icon: UserPlus,
    path: '/staff-accounts/add',
    color: 'text-rose-600',
    bgColor: 'bg-rose-600/10',
    category: 'create'
  },
  {
    id: 'add-department',
    title: 'Add Department',
    description: 'Create new department',
    icon: Building2,
    path: '/employees?view=add-department',
    color: 'text-rose-600',
    bgColor: 'bg-rose-600/10',
    category: 'create'
  }
];

// Read operations
const readOperations: DatabaseOperation[] = [
  {
    id: 'view-medicines',
    title: 'View Medicines',
    description: 'Browse medicine catalog',
    icon: Pill,
    path: '/medicines',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'read'
  },
  {
    id: 'check-inventory',
    title: 'Check Inventory',
    description: 'View current stock levels',
    icon: Package,
    path: '/inventory',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'read'
  },
  {
    id: 'view-orders',
    title: 'View Orders',
    description: 'Manage purchase orders',
    icon: FileCheck,
    path: '/orders',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    category: 'read'
  },
  {
    id: 'view-patients',
    title: 'Patient Records',
    description: 'Access patient database',
    icon: Users,
    path: '/patients',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    category: 'read'
  }
];

// Analytics operations
const analyticsOperations: DatabaseOperation[] = [
  {
    id: 'inventory-analytics',
    title: 'Inventory Analytics',
    description: 'Stock level trends and projections',
    icon: BarChart3,
    path: '/analytics?view=inventory',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'analytics'
  },
  {
    id: 'sales-analytics',
    title: 'Sales Analytics',
    description: 'Revenue analysis and forecasts',
    icon: FileBarChart2,
    path: '/analytics?view=sales',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    category: 'analytics'
  }
];

// System operations
const systemOperations: DatabaseOperation[] = [
  {
    id: 'database-explorer',
    title: 'Database Explorer',
    description: 'Advanced database exploration tool',
    icon: Database,
    path: '/database-explorer',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600/10',
    category: 'system',
    badge: 'Enhanced',
    badgeColor: 'info'
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Export data to CSV/Excel',
    icon: Download,
    path: '/database-explorer?view=export',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'system'
  },
  {
    id: 'backup-database',
    title: 'Backup Database',
    description: 'Create a full database backup',
    icon: RotateCw,
    path: '/database-explorer?view=backup',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    category: 'system'
  },
  {
    id: 'import-data',
    title: 'Import Data',
    description: 'Import data from CSV/Excel',
    icon: Upload,
    path: '/database-explorer?view=import',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    category: 'system'
  }
];

// Combine all operations
const allOperations = [
  ...createOperations,
  ...readOperations,
  ...analyticsOperations,
  ...systemOperations
];

export function AppHub() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showingFilter, setShowingFilter] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | null>(null);
  
  // Filter tables based on the selected category and search term
  const filteredTables = databaseTables
    .filter(table => !selectedCategory || table.category === selectedCategory.toLowerCase())
    .filter(table => !searchTerm || table.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter operations based on search term
  const filteredOperations = allOperations
    .filter(op => !searchTerm || 
      op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const featuredCreateOperations = createOperations.filter(op => op.featured);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setActiveTab(null);
  };

  // Navigate to a specific path with enhanced feedback
  const handleNavigate = (path: string, tableName?: string) => {
    if (!path) return;
    
    try {
      // Special case for ActivityLog table
      if (tableName === "ActivityLog") {
        router.push("/database-explorer?table=ActivityLog");
        return;
      }
      
      // For database explorer with a specific table, add the table parameter
      const finalPath = tableName ? `${path}?table=${tableName}&view=data` : path;
      router.push(finalPath);
      toast({
        title: "Navigating...",
        description: tableName 
          ? `Opening ${tableName} table in Database Explorer`
          : `Opening ${path}`,
      });
    } catch (error) {
      toast({
        title: "Navigation error",
        description: "Failed to navigate to the selected page",
        variant: "destructive"
      });
    }
  };

  // Handle search clearing
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Toggle filter
  const handleToggleFilter = () => {
    setShowingFilter(!showingFilter);
  };

  // View all click handler
  const handleViewAll = (category: string) => {
    if (category === 'system') {
      handleNavigate('/database-explorer');
      return;
    }
    
    toast({
      title: "View All",
      description: `Viewing all ${category} items`,
    });
  };

  // Set active tab
  const handleSetActiveTab = (tab: 'create' | 'browse' | null) => {
    setActiveTab(activeTab === tab ? null : tab);
    setSelectedCategory(null);
  };

  return (
    <ScrollArea className="h-full w-full overflow-x-auto overflow-y-auto" type="always">
      <div className="p-6 min-w-[800px] bg-background/95 backdrop-blur-sm">
        {/* Header with title and search */}
        <div className="flex flex-col space-y-1.5 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Database Operations Hub</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search operations..."
                  className="pl-8 w-[220px] bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search operations"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9"
                onClick={handleToggleFilter}
                aria-label="Filter"
              >
                <Filter size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleClearSearch}
                aria-label="Clear"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Centralized access to all database operations and tables</p>
        </div>

        {/* Quick Add Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant={activeTab === 'create' ? "default" : "outline"}
              className="mr-2"
              onClick={() => handleSetActiveTab('create')}
            >
              <Plus className="mr-1 h-4 w-4" /> Create New
            </Button>
            <Button 
              variant={activeTab === 'browse' ? "default" : "outline"}
              onClick={() => handleSetActiveTab('browse')}
            >
              <LayoutGrid className="mr-1 h-4 w-4" /> Browse Categories
            </Button>
          </div>

          {activeTab === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredCreateOperations.map((operation, idx) => (
                <motion.div
                  key={operation.id}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  custom={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer bg-background border border-primary/20 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                    onClick={() => operation.path && handleNavigate(operation.path)}
                    role="button"
                    tabIndex={0}
                    aria-label={operation.title}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                        <operation.icon className={`h-5 w-5 ${operation.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{operation.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {operation.description}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="px-4 py-2 border-t border-border/20 flex justify-end">
                      <Button size="sm" variant="ghost" className="h-8">
                        <Plus size={14} className="mr-1" /> Add
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {activeTab === 'browse' ? (
          /* Categories Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {databaseCategories.map((category, idx) => (
              <motion.div
                key={category.name}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                custom={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer overflow-hidden border border-border/30 shadow-sm h-full transition-all",
                    selectedCategory === category.name ? "ring-2 ring-primary/30" : "hover:border-border/60"
                  )}
                  onClick={() => handleCategoryClick(category.name)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCategory === category.name}
                  aria-label={`${category.name} category with ${category.tables} tables`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(category.name);
                    }
                  }}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <h3 className="font-semibold mt-3">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    <Badge variant="outline" className="mt-3 text-xs">
                      {category.tables} tables
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : activeTab === null && !selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {databaseCategories.map((category, idx) => (
              <motion.div
                key={category.name}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                custom={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer overflow-hidden border border-border/30 shadow-sm h-full transition-all",
                    selectedCategory === category.name ? "ring-2 ring-primary/30" : "hover:border-border/60"
                  )}
                  onClick={() => handleCategoryClick(category.name)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCategory === category.name}
                  aria-label={`${category.name} category with ${category.tables} tables`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(category.name);
                    }
                  }}
                >
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <h3 className="font-semibold mt-3">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    <Badge variant="outline" className="mt-3 text-xs">
                      {category.tables} tables
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null}
        
        {/* Tables or Operations */}
        {selectedCategory ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedCategory} Tables</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  aria-label="View all categories"
                >
                  View All Categories
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleNavigate(`/database-explorer?category=${selectedCategory.toLowerCase()}`)}
                >
                  <Database size={14} className="mr-1" />
                  Explore All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[700px]">
              {filteredTables.length > 0 ? (
                filteredTables.map((table, idx) => (
                  <motion.div
                    key={table.name}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    custom={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                      onClick={() => handleNavigate('/database-explorer', table.name)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${table.name} table with ${table.count} records`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNavigate('/database-explorer', table.name);
                        }
                      }}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-2.5 rounded-md ${table.color.replace('text', 'bg').replace('600', '100')}`}>
                          <table.icon className={`h-5 w-5 ${table.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{table.name}</h3>
                            <Badge variant="outline">{table.count?.toLocaleString()}</Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">
                              Updated {table.lastUpdated}
                            </span>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-7 px-2 text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate('/database-explorer', table.name);
                              }}
                              aria-label={`View ${table.name} table`}
                            >
                              View <ChevronRight size={13} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No tables found for the selected category with the current search term.
                </div>
              )}
            </div>

            {/* Display relevant create operations for the selected category */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Add New {selectedCategory} Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {createOperations
                  .filter(op => {
                    const categoryLower = selectedCategory.toLowerCase();
                    if (categoryLower === 'inventory') return op.color.includes('blue');
                    if (categoryLower === 'orders') return op.color.includes('green');
                    if (categoryLower === 'patients') return op.color.includes('amber');
                    if (categoryLower === 'finance') return op.color.includes('purple');
                    if (categoryLower === 'operations') return op.color.includes('rose');
                    if (categoryLower === 'system') return op.color.includes('slate');
                    return false;
                  })
                  .map((operation, idx) => (
                    <motion.div
                      key={operation.id}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      custom={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer bg-background border border-primary/20 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                        onClick={() => operation.path && handleNavigate(operation.path)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                            <operation.icon className={`h-5 w-5 ${operation.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{operation.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {operation.description}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-2 border-t border-border/20 flex justify-end">
                          <Button size="sm" variant="ghost" className="h-8">
                            <Plus size={14} className="mr-1" /> Add
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          activeTab === null && (
            <div className="space-y-8">
              {/* Create Operations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Create</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleSetActiveTab('create')}
                    aria-label="View all create operations"
                  >
                    View All <ChevronRight size={14} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[700px]">
                  {filteredOperations.filter(op => op.category === 'create' && op.featured).map((operation, idx) => (
                    <motion.div
                      key={operation.id}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      custom={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer bg-background border border-primary/20 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                        onClick={() => operation.path && handleNavigate(operation.path)}
                        role="button"
                        tabIndex={0}
                        aria-label={operation.title}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                            <operation.icon className={`h-5 w-5 ${operation.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{operation.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {operation.description}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="px-4 py-2 border-t border-border/20 flex justify-end">
                          <Button size="sm" variant="ghost" className="h-8">
                            <Plus size={14} className="mr-1" /> Add
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Read Operations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Browse</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleViewAll('read')}
                    aria-label="View all read operations"
                  >
                    View All <ChevronRight size={14} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[700px]">
                  {readOperations.slice(0, 4).map((operation, idx) => (
                    <motion.div
                      key={operation.id}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      custom={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                        onClick={() => operation.path && handleNavigate(operation.path)}
                        role="button"
                        tabIndex={0}
                        aria-label={operation.title}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                            <operation.icon className={`h-5 w-5 ${operation.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{operation.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {operation.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Analytics Operations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Analytics</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleViewAll('analytics')}
                    aria-label="View all analytics operations"
                  >
                    View All <ChevronRight size={14} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[700px]">
                  {analyticsOperations.map((operation, idx) => (
                    <motion.div
                      key={operation.id}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      custom={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                        onClick={() => operation.path && handleNavigate(operation.path)}
                        role="button"
                        tabIndex={0}
                        aria-label={operation.title}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                            <operation.icon className={`h-5 w-5 ${operation.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{operation.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {operation.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* System Operations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">System</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleViewAll('system')}
                    aria-label="View all system operations"
                  >
                    View All <ChevronRight size={14} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[700px]">
                  {systemOperations.map((operation, idx) => (
                    <motion.div
                      key={operation.id}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      custom={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                        onClick={() => operation.path && handleNavigate(operation.path)}
                        role="button"
                        tabIndex={0}
                        aria-label={operation.title}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                            <operation.icon className={`h-5 w-5 ${operation.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{operation.title}</h3>
                              {operation.badge && (
                                <Badge variant="secondary" className="text-xs">{operation.badge}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {operation.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
        
        {activeTab === 'create' && (
          <div className="space-y-8">
            {/* All Create Operations by Category */}
            <div>
              <h3 className="text-xl font-semibold mb-4">All Create Operations</h3>
              
              {/* Inventory */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <Package className="mr-2 h-5 w-5 text-blue-600" /> 
                  Inventory Management
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {createOperations
                    .filter(op => op.color.includes('blue'))
                    .map((operation, idx) => (
                      <motion.div
                        key={operation.id}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        custom={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                          onClick={() => operation.path && handleNavigate(operation.path)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                              <operation.icon className={`h-5 w-5 ${operation.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{operation.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {operation.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  ))}
                </div>
              </div>

              {/* Orders */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-green-600" /> 
                  Orders & Supply Chain
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {createOperations
                    .filter(op => op.color.includes('green'))
                    .map((operation, idx) => (
                      <motion.div
                        key={operation.id}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        custom={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                          onClick={() => operation.path && handleNavigate(operation.path)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                              <operation.icon className={`h-5 w-5 ${operation.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{operation.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {operation.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  ))}
                </div>
              </div>

              {/* Patients */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-amber-600" /> 
                  Patients & Medical
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {createOperations
                    .filter(op => op.color.includes('amber'))
                    .map((operation, idx) => (
                      <motion.div
                        key={operation.id}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        custom={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                          onClick={() => operation.path && handleNavigate(operation.path)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                              <operation.icon className={`h-5 w-5 ${operation.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{operation.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {operation.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  ))}
                </div>
              </div>

              {/* Finance */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-purple-600" /> 
                  Financial Management
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {createOperations
                    .filter(op => op.color.includes('purple'))
                    .map((operation, idx) => (
                      <motion.div
                        key={operation.id}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        custom={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                          onClick={() => operation.path && handleNavigate(operation.path)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                              <operation.icon className={`h-5 w-5 ${operation.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{operation.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {operation.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  ))}
                </div>
              </div>

              {/* Staff & Administration */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 flex items-center">
                  <UserPlus className="mr-2 h-5 w-5 text-rose-600" /> 
                  Staff & Administration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {createOperations
                    .filter(op => op.color.includes('rose'))
                    .map((operation, idx) => (
                      <motion.div
                        key={operation.id}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        custom={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                          onClick={() => operation.path && handleNavigate(operation.path)}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-md ${operation.bgColor}`}>
                              <operation.icon className={`h-5 w-5 ${operation.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{operation.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {operation.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add extra padding at the bottom for better scrolling experience */}
        <div className="h-6" aria-hidden="true"></div>
      </div>
    </ScrollArea>
  );
}