'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Card, CardContent
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
  Download, RotateCw, Upload, Activity, BadgeAlert, MessageSquare
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
  { name: "MedicalLogs", count: 673, lastUpdated: "15m ago", category: 'operations', icon: ClipboardList, color: 'text-rose-600' },
  
  { name: "ActivityLog", count: 145, lastUpdated: "10m ago", category: 'system', icon: Activity, color: 'text-slate-600' },
  { name: "ExpiryAlert", count: 27, lastUpdated: "10m ago", category: 'system', icon: BadgeAlert, color: 'text-slate-600' },
  { name: "Feedback", count: 89, lastUpdated: "4h ago", category: 'system', icon: MessageSquare, color: 'text-slate-600' },
];

// Common database operations
const commonOperations: DatabaseOperation[] = [
  {
    id: 'add-medicine',
    title: 'Add Medicine',
    description: 'Create a new medicine entry',
    icon: Pill,
    path: '/medicines/add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'create'
  },
  {
    id: 'add-inventory',
    title: 'Add Inventory',
    description: 'Add new inventory stock',
    icon: Package,
    path: '/inventory/add',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    category: 'create'
  },
  {
    id: 'database-explorer',
    title: 'Database Explorer',
    description: 'Advanced database exploration tool',
    icon: Database,
    path: '/database-explorer',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600/10',
    category: 'system',
    badge: 'New',
    badgeColor: 'info'
  }
];

export function AppHub() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showingFilter, setShowingFilter] = useState(false);
  
  // Filter tables based on the selected category and search term
  const filteredTables = databaseTables
    .filter(table => !selectedCategory || table.category === selectedCategory.toLowerCase())
    .filter(table => !searchTerm || table.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter operations based on search term
  const filteredOperations = commonOperations
    .filter(op => !searchTerm || 
      op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  };

  // Navigate to a specific path with enhanced feedback
  const handleNavigate = (path: string, tableName?: string) => {
    if (!path) return;
    
    try {
      // Special case for ActivityLog table
      if (tableName === "ActivityLog") {
        router.push("http://localhost:3000/database-explorer?table=ActivityLog");
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
        
        {/* Categories Grid */}
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
          </div>
        ) : (
          <div className="space-y-8">
            {/* Create Operations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Create</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => handleViewAll('create')}
                  aria-label="View all create operations"
                >
                  View All <ChevronRight size={14} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[700px]">
                {filteredOperations.filter(op => op.category === 'create').slice(0, 4).map((operation, idx) => (
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          operation.path && handleNavigate(operation.path);
                        }
                      }}
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
            
            {/* Read Operations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Read</h3>
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
                {filteredOperations.filter(op => op.category === 'read').slice(0, 4).map((operation, idx) => (
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          operation.path && handleNavigate(operation.path);
                        }
                      }}
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
                {filteredOperations.filter(op => op.category === 'analytics').map((operation, idx) => (
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          operation.path && handleNavigate(operation.path);
                        }
                      }}
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
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  custom={0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                    onClick={() => handleNavigate('/database-explorer')}
                    role="button"
                    tabIndex={0}
                    aria-label="Database explorer"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate('/database-explorer');
                      }
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2.5 rounded-md bg-slate-600/10">
                        <Database className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Database Explorer</h3>
                          <Badge variant="secondary" className="text-xs">Enhanced</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Advanced data exploration & management
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  custom={1}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                    onClick={() => handleNavigate('/database-explorer?view=export')}
                    role="button"
                    tabIndex={0}
                    aria-label="Export data"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate('/database-explorer?view=export');
                      }
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2.5 rounded-md bg-blue-600/10">
                        <Download className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Export Data</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Export data to CSV/Excel
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  custom={2}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                    onClick={() => handleNavigate('/database-explorer?view=backup')}
                    role="button"
                    tabIndex={0}
                    aria-label="Backup database"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate('/database-explorer?view=backup');
                      }
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2.5 rounded-md bg-amber-600/10">
                        <RotateCw className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Backup Database</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a full database backup
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  custom={3}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer bg-background border border-border/30 shadow-sm hover:border-border/60 hover:shadow-md transition-all"
                    onClick={() => handleNavigate('/database-explorer?view=import')}
                    role="button"
                    tabIndex={0}
                    aria-label="Import data"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate('/database-explorer?view=import');
                      }
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2.5 rounded-md bg-green-600/10">
                        <Upload className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Import Data</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Import data from CSV/Excel
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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