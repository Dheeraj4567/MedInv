'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  LayoutGrid, Package, Pill, ShoppingCart, Users, FileText,
  ClipboardList, Truck, UserCog, BarChart3, Receipt, DollarSign,
  Percent, Bell, MessageSquare, ChevronDown, ChevronRight, Calendar,
  Activity, HardDrive, Layers, ListChecks, UserPlus, Building2,
  History, BadgeAlert, type LucideIcon, Moon, Sun,
  Settings, Search, ArrowLeftRight, SlidersHorizontal, Maximize2,
  Minimize2, X, Loader2, ExternalLink, Table, ChevronLeft, Home,
  User, LogOut, HelpCircle, AlertCircle, CheckCircle2, BookOpen,
  Star, Pin, PinOff, Grid, Database
} from 'lucide-react';

// Import UI components with proper error handling
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { useMediaQuery } from '@/hooks/use-mobile';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter 
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from '@/hooks/use-toast';

// Import dynamic components
const AppHub = dynamic(() => import('./app-hub').then(mod => ({ default: mod.AppHub })), {
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
});

const DatabaseExplorer = dynamic(() => import('./database-explorer').then(mod => ({ default: mod.DatabaseExplorer })), {
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
});

// Define interface for menu items
interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  isFavorite?: boolean;
}

// Define interface for menu categories
interface MenuCategory {
  category: string;
  items: MenuItem[];
  expanded?: boolean;
}

// Database table interface
interface DatabaseTable {
  name: string;
  count?: number;
  lastUpdated?: string;
  isNew?: boolean;
}

// Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

// User profile interface
interface UserProfile {
  name: string;
  role: string;
  avatar?: string;
  email: string;
}

// Organized menu structure by categories
const menuStructure: MenuCategory[] = [
  {
    category: "Overview",
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: LayoutGrid
      },
      {
        label: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
        badge: 'New',
        badgeColor: 'success'
      }
    ]
  },
  {
    category: "Inventory Management",
    items: [
      {
        label: 'Inventory',
        path: '/inventory',
        icon: Package
      },
      {
        label: 'Medicines',
        path: '/medicines',
        icon: Pill
      },
      {
        label: 'Drug Categories',
        path: '/drug-categories',
        icon: Layers
      }
    ]
  },
  {
    category: "Orders & Supply Chain",
    items: [
      {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingCart,
        badge: 2,
        badgeColor: 'warning'
      },
      {
        label: 'Suppliers',
        path: '/suppliers',
        icon: Truck
      }
    ]
  },
  {
    category: "Patients & Medical",
    items: [
      {
        label: 'Patients',
        path: '/patients',
        icon: Users
      },
      {
        label: 'Prescriptions',
        path: '/prescriptions',
        icon: FileText
      }
    ]
  },
  {
    category: "Financial",
    items: [
      {
        label: 'Billing',
        path: '/billing',
        icon: Receipt
      },
      {
        label: 'Bill Logs',
        path: '/billing?view=logs',
        icon: DollarSign
      },
      {
        label: 'Discounts',
        path: '/discounts',
        icon: Percent
      }
    ]
  },
  {
    category: "Staff & Administration",
    items: [
      {
        label: 'Staff Accounts',
        path: '/staff-accounts',
        icon: UserCog
      },
      {
        label: 'Employees',
        path: '/employees',
        icon: UserPlus
      }
    ]
  },
  {
    category: "Feedback & Notifications",
    items: [
      {
        label: 'Feedback',
        path: '/feedback',
        icon: MessageSquare
      },
      {
        label: 'Activity Logs',
        path: '/activity-logs',
        icon: Activity,
        badge: 'Live',
        badgeColor: 'info'
      }
    ]
  }
];

// Sample database tables with enhanced metadata
const databaseTables: DatabaseTable[] = [
  { name: "ActivityLog", count: 145, lastUpdated: "10m ago" },
  { name: "Billing", count: 327, lastUpdated: "25m ago" },
  { name: "BillingDetails", count: 58, lastUpdated: "15m ago" },
  { name: "BillLogs", count: 126, lastUpdated: "20m ago" },
  { name: "Discount", count: 42, lastUpdated: "3h ago" },
  { name: "DrugCategory", count: 38, lastUpdated: "2d ago" },
  { name: "Employee", count: 124, lastUpdated: "1d ago" },
  { name: "ExpiryAlert", count: 27, lastUpdated: "10m ago" },
  { name: "Feedback", count: 89, lastUpdated: "4h ago" },
  { name: "Inventory", count: 327, lastUpdated: "25m ago" },
  { name: "InventoryBatch", count: 856, lastUpdated: "32m ago" },
  { name: "MedicalLogs", count: 673, lastUpdated: "15m ago" },
  { name: "Medicine", count: 145, lastUpdated: "10m ago" },
  { name: "MedicineManufacturer", count: 48, lastUpdated: "2h ago" },
  { name: "OrderItems", count: 2341, lastUpdated: "5m ago", isNew: true },
  { name: "OrderLogs", count: 574, lastUpdated: "30m ago" },
  { name: "Orders", count: 982, lastUpdated: "5m ago" },
  { name: "Patient", count: 1254, lastUpdated: "1h ago" },
  { name: "Prescription", count: 856, lastUpdated: "32m ago" },
  { name: "PrescriptionDetails", count: 2104, lastUpdated: "1h ago" },
  { name: "StaffAccount", count: 73, lastUpdated: "5h ago" },
  { name: "Supplier", count: 48, lastUpdated: "2h ago" }
];

// Sample notifications
const sampleNotifications: Notification[] = [
  
];

// Sample user profile
const userProfile: UserProfile = {
  name: "Dr. Sarah Johnson",
  role: "Head Pharmacist",
  email: "sarah.johnson@medinventory.com",
  avatar: "/placeholder-user.jpg"
};

export default function Sidebar({ collapsed, toggleCollapsed, className, onExpandChange }: { 
  collapsed: boolean, 
  toggleCollapsed: () => void, 
  className?: string,
  onExpandChange?: (expanded: boolean) => void 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // State variables
  const [showDbExplorer, setShowDbExplorer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dbSearchTerm, setDbSearchTerm] = useState('');
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [pinnedTables, setPinnedTables] = useState<string[]>(["Medicine", "Inventory"]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoExpand, setAutoExpand] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showAppHub, setShowAppHub] = useState(false);

  // Fixed navigation handler function for clicking sidebar items
  const handleNavigate = (path: string) => {
    try {
      if (isMobile) {
        // For mobile, collapse sidebar after navigation
        toggleCollapsed();
        setAutoExpand(false);
      }
      
      // Use Next.js router to navigate - using replace to ensure clean navigation
      router.push(path, { scroll: true });
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Fallback to traditional navigation if router.push fails
      window.location.href = path;
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    try {
      // Add any specific logout logic here (e.g., clearing tokens)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      // Use router.replace to prevent back navigation after logout
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  // Filter menu items based on search term
  const filteredMenuItems = menuStructure.filter((category) =>
    category.items.some((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    menuStructure.reduce((acc, category) => {
      const shouldExpand = category.items.some(item => 
        pathname === item.path || pathname.startsWith(item.path.split('?')[0])
      );
      return { ...acc, [category.category]: shouldExpand };
    }, {})
  );

  // Toggle theme between light and dark mode
  const toggleTheme = () => {
    try {
      // Force the theme to toggle between light and dark only, not system
      setTheme(theme === 'dark' ? 'light' : 'dark');
      
      toast({
        title: `Theme changed to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        description: "Your preference has been saved",
        variant: "default",
      });
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  };

  // Handle toggling favorites
  const toggleFavorite = (path: string) => {
    try {
      setFavoriteItems(prev => {
        if (prev.includes(path)) {
          return prev.filter(p => p !== path);
        } else {
          return [...prev, path];
        }
      });
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  // Get favorite menu items
  const favoriteMenuItems = menuStructure
    .flatMap(category => category.items)
    .filter(item => favoriteItems.includes(item.path));

  // Count unread notifications
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    try {
      setExpandedCategories(prev => ({
        ...prev,
        [category]: !prev[category]
      }));
    } catch (error) {
      console.error('Category toggle error:', error);
    }
  };

  // Handle database table click
  const handleTableClick = (tableName: string) => {
    try {
      setLoadingTable(tableName);
      
      // Navigate to database explorer with selected table
      setTimeout(() => {
        setLoadingTable(null);
        router.push(`/database-explorer?table=${tableName}`);
      }, 300);
    } catch (error) {
      console.error('Table click error:', error);
      setLoadingTable(null);
    }
  };

  // Handle auto-expand behavior when mouse approaches the sidebar
  useEffect(() => {
    if (!isMounted) return; // Skip the effect on the server side
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!collapsed || isMobile) return;
      
      // Detect if mouse is within 40px of the left edge of the screen
      if (e.clientX <= 40 && !autoExpand) {
        if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
        expandTimeoutRef.current = setTimeout(() => {
          setAutoExpand(true);
          if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
        }, 100); // Small delay to prevent accidental triggering
      } else if (e.clientX > 300 && autoExpand) {
        // When mouse moves far away from the sidebar, start a timer to collapse it
        if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = setTimeout(() => {
          // Check if mouse is over the main content area and not the sidebar
          const sidebarElement = sidebarRef.current;
          if (sidebarElement && !sidebarElement.contains(document.elementFromPoint(e.clientX, e.clientY))) {
            setAutoExpand(false);
          }
        }, 1000); // Longer delay before collapsing
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    };
  }, [collapsed, autoExpand, isMobile, isMounted]);

  // Notify parent component about auto-expand state changes
  useEffect(() => {
    if (onExpandChange && isMounted) {
      onExpandChange(autoExpand);
    }
  }, [autoExpand, onExpandChange, isMounted]);

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Load favorites from localStorage on mount
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      const storedFavorites = localStorage.getItem('sidebarFavorites');
      if (storedFavorites) {
        setFavoriteItems(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [isMounted]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      localStorage.setItem('sidebarFavorites', JSON.stringify(favoriteItems));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favoriteItems, isMounted]);

  // Update expanded categories when pathname changes
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      setExpandedCategories(prev => {
        const updated = { ...prev };
        menuStructure.forEach(category => {
          if (category.items.some(item => 
            pathname === item.path || pathname.startsWith(item.path.split('?')[0])
          )) {
            updated[category.category] = true;
          }
        });
        return updated;
      });
    } catch (error) {
      console.error('Error updating expanded categories:', error);
    }
  }, [pathname, isMounted]);

  // Handle search functionality
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      if (searchQuery.trim().length > 1) {
        const results = menuStructure.flatMap(category => 
          category.items.filter(item => 
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error updating search results:', error);
    }
  }, [searchQuery, isMounted]);

  // If not mounted yet (server-side), return a minimal placeholder
  if (!isMounted) {
    return <div className={cn("flex h-screen flex-col bg-background border-r border-border/50", className)} />;
  }

  return (
    <>
      <TooltipProvider>
        <motion.aside
          ref={sidebarRef}
          className={cn(
            "flex h-screen flex-col",
            "bg-background/95 backdrop-blur-lg border-r border-border/50",
            "transition-all duration-300 ease-in-out",
            "shadow-lg shadow-primary/5",
            "z-50", // Added higher z-index to ensure sidebar is above other elements
            className
          )}
          initial={false}
          animate={{ width: (collapsed && !autoExpand) ? (isMobile ? 0 : 70) : 260 }}
          onMouseEnter={() => {
            // Keep expanded when actually hovering over the sidebar
            if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
            if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
            setAutoExpand(true);
          }}
          onMouseLeave={() => {
            // Don't immediately collapse when mouse leaves the sidebar
            if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = setTimeout(() => {
              if (collapsed) {
                setAutoExpand(false);
                setShowDbExplorer(false);
                setShowSettings(false);
              }
            }, 1000);
          }}
        >
          {/* Logo and collapse button */}
          <div className={cn(
            "flex items-center justify-between px-4 py-3",
            "border-b border-border/50 h-16"
          )}>
            <AnimatePresence initial={false}>
              {(!collapsed || autoExpand) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <div className="text-primary font-bold text-xl tracking-tight flex items-center">
                    <span className="text-primary">Med</span>
                    <span className="text-primary/80">Inventory</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground focus:outline-none"
              onClick={() => {
                toggleCollapsed();
                setAutoExpand(false);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {(collapsed && !autoExpand) ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>
          </div>
          
          {/* User profile section */}
          {(!collapsed || autoExpand) && (
            <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userProfile.role}</p>
              </div>
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/staff-accounts')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowHelpModal(true)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/login')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Search bar */}
          <div className="px-3 py-2 border-b border-border/50">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Main menu with categories */}
          <ScrollArea className="flex-grow overflow-y-auto py-2">
            {/* Favorites Section */}
            {favoriteMenuItems.length > 0 && (!collapsed || autoExpand) && (
              <div className="mb-2 px-2">
                <div className={cn(
                  "flex w-full items-center px-3 py-2 mb-1",
                  "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                  collapsed && !autoExpand ? "justify-center" : "justify-between"
                )}>
                  {(!collapsed || autoExpand) && <span>Favorites</span>}
                  {(!collapsed || autoExpand) && <Star size={14} className="text-amber-400"/>}
                </div>
                <div className="space-y-1">
                  {favoriteMenuItems.map(item => {
                    const isActive = pathname === item.path || 
                                     pathname.startsWith(`${item.path.split('?')[0]}/`);
                    return (
                      <Tooltip key={`fav-${item.path}`} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center group">
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 mx-2 my-0.5 flex-grow justify-start",
                                "rounded-md text-sm transition-all duration-200",
                                isActive 
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                                  : "hover:bg-accent/50 text-foreground"
                              )}
                              onClick={() => handleNavigate(item.path)}
                            >
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <item.icon size={18} className={isActive ? "text-primary-foreground" : "text-foreground/70"} />
                              </motion.div>
                              {(!collapsed || autoExpand) && (
                                <span className="flex-grow truncate">{item.label}</span>
                              )}
                              {item.badge && (!collapsed || autoExpand) && (
                                <Badge variant={item.badgeColor || "default"} className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Button>
                            {/* Favorite Toggle Button for Favorites Section */}
                            {(!collapsed || autoExpand) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent navigation when toggling favorite
                                  toggleFavorite(item.path);
                                }}
                              >
                                <PinOff size={14} className="text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="z-50">
                          {item.label}
                          {item.badge && (
                            <Badge variant={item.badgeColor || "default"} className="ml-2">{item.badge}</Badge>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <Separator className="my-3" />
              </div>
            )}

            {/* Regular Menu Categories */}
            {filteredMenuItems.map((category, idx) => (
              <div key={category.category} className="mb-1">
                {/* Category header */}
                <motion.button
                  className={cn(
                    "flex w-full items-center px-3 py-2",
                    "hover:bg-accent/50 rounded-md mx-2",
                    "transition-colors duration-200",
                    "focus:outline-none", // Added focus outline none for better UX
                    collapsed && !autoExpand ? "justify-center" : "justify-between"
                  )}
                  onClick={() => toggleCategory(category.category)}
                  whileHover={{ backgroundColor: "rgba(var(--accent), 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {(!collapsed || autoExpand) && (
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {category.category}
                    </span>
                  )}
                  
                  {(!collapsed || autoExpand) && (
                    <div className="text-muted-foreground">
                      {expandedCategories[category.category] ? 
                        <ChevronDown size={14} /> : 
                        <ChevronRight size={14} />
                      }
                    </div>
                  )}
                </motion.button>
                
                {/* Category items with conditional rendering for expanded state */}
                <AnimatePresence initial={false}>
                  {((!collapsed || autoExpand) && expandedCategories[category.category]) || 
                   (collapsed && !autoExpand) ? (
                    <motion.div
                      initial={(!collapsed || autoExpand) ? { height: 0, opacity: 0 } : {}}
                      animate={(!collapsed || autoExpand) ? { height: "auto", opacity: 1 } : {}}
                      exit={(!collapsed || autoExpand) ? { height: 0, opacity: 0 } : {}}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-0.5"
                    >
                      {category.items.filter(item => 
                        !searchTerm || item.label.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(item => {
                        const isActive = pathname === item.path || 
                          pathname.startsWith(`${item.path.split('?')[0]}/`);
                        const isFavorite = favoriteItems.includes(item.path);
                          
                        return (
                          <Tooltip key={item.path} delayDuration={300}>
                            <TooltipTrigger asChild>
                              {/* Wrap Button and Favorite Button in a div for group hover */} 
                              <div className="flex items-center group">
                                <Button
                                  variant={isActive ? "default" : "ghost"}
                                  className={cn(
                                    "flex items-center gap-3",
                                    collapsed && !autoExpand ? "justify-center px-2 py-3 mx-1" : "px-4 py-2 mx-2",
                                    "my-0.5 flex-grow justify-start",
                                    "rounded-md text-sm transition-all duration-200",
                                    isActive 
                                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                                      : "hover:bg-accent/50 text-foreground"
                                  )}
                                  onClick={() => handleNavigate(item.path)}
                                >
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                    <item.icon size={18} className={isActive ? "text-primary-foreground" : "text-foreground/70"} />
                                  </motion.div>
                                  {(!collapsed || autoExpand) && (
                                    <span className="flex-grow truncate">{item.label}</span>
                                  )}
                                  {item.badge && (!collapsed || autoExpand) && (
                                    <Badge variant={item.badgeColor || "default"} className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Button>
                                
                                {/* Favorite Toggle Button */}
                                {(!collapsed || autoExpand) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-7 w-7 mr-2 transition-opacity duration-150",
                                      isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent navigation when toggling favorite
                                      toggleFavorite(item.path);
                                    }}
                                  >
                                    {isFavorite ? (
                                      <PinOff size={14} className="text-muted-foreground hover:text-destructive" />
                                    ) : (
                                      <Pin size={14} className="text-muted-foreground hover:text-primary" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="z-50">
                              {item.label}
                              {item.badge && (
                                <Badge variant={item.badgeColor || "default"} className="ml-2">{item.badge}</Badge>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </ScrollArea>
          
          {/* Bottom action buttons */}
          <div className={cn(
            "p-3 border-t border-border/50 flex flex-col gap-2", // Changed flex direction and added gap
            (collapsed && !autoExpand) ? "items-center" : "items-stretch" // Adjusted alignment
          )}>
            {/* Row for Theme and Logout */}
            <div className={cn(
              "flex w-full",
              (collapsed && !autoExpand) ? "justify-center" : "justify-between"
            )}>
              {/* Theme toggle button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="rotate-0 scale-100 transition-all" />
                ) : (
                  <Moon size={18} className="rotate-0 scale-100 transition-all" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              {/* Logout button */}
              {(!collapsed || autoExpand) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout} // Call logout handler
                >
                  <LogOut size={18} />
                  <span className="sr-only">Logout</span>
                </Button>
              )}
            </div>

            {/* Database Explorer button - ADDED BACK */}
            {(!collapsed || autoExpand) && ( // Conditionally render based on collapsed state
              <Button
                variant="outline" // Changed variant for better distinction
                size="sm" // Adjusted size
                className="h-9 w-full rounded-md flex items-center justify-center gap-2" // Adjusted styling
                onClick={() => window.location.href = 'http://localhost:3000/database-explorer?table=ActivityLog'}
              >
                <Database size={16} /> {/* Adjusted icon size */}
                {(!collapsed || autoExpand) && <span>DB Explorer</span>} {/* Show text only when expanded */}
              </Button>
            )}
             {/* Tooltip for collapsed state */}
            {(collapsed && !autoExpand) && (
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                   <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-md"
                      onClick={() => window.location.href = 'http://localhost:3000/database-explorer?table=ActivityLog'}
                    >
                      <Database size={16} />
                      <span className="sr-only">Database Explorer</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Database Explorer</TooltipContent>
              </Tooltip>
            )}
          </div>
        </motion.aside>
      </TooltipProvider>

      {/* "Hot zone" invisible element to help trigger the auto-expand */}
      <div 
        className="fixed left-0 top-0 w-[20px] h-screen z-10 opacity-0"
        onMouseEnter={() => {
          if (collapsed) {
            if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
            expandTimeoutRef.current = setTimeout(() => {
              setAutoExpand(true);
            }, 100);
          }
        }}
      />
      
      {/* Dialog modals and other UI components */}
      {/* Profile Modal */}
      {showProfileModal && (
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
              <DialogDescription>
                View and edit your profile information.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowProfileModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Help Modal */}
      {showHelpModal && (
        <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Help & Support</DialogTitle>
              <DialogDescription>
                Get assistance and find answers to your questions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowHelpModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* App Hub Dialog */}
      <Dialog open={showAppHub} onOpenChange={setShowAppHub} modal={true}>
        <DialogContent className="max-w-5xl w-[95%] h-[85vh] overflow-hidden p-0 border-border/50">
          <DialogHeader className="p-4 border-b border-border/50">
            <DialogTitle>App Hub</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[calc(100%-60px)] overflow-auto">
            <AppHub />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
