"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import PageLoader from "@/components/page-loader";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const pathname = usePathname();

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setIsSidebarCollapsed(JSON.parse(savedState));
      }
      
      // Always ensure sidebar is visible on mount (except login)
      if (pathname !== "/login") {
        setIsSidebarVisible(true);
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error);
    }
  }, [pathname]);

  // Save sidebar state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    } catch (error) {
      console.error('Error saving sidebar state:', error);
    }
  }, [isSidebarCollapsed]);

  // Simulate loading for better UX
  useEffect(() => {
    // Fast loading for subsequent navigation
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Ensure sidebar is visible after page load (except login)
      if (pathname !== "/login") {
        setIsSidebarVisible(true);
      }
    }, pathname === "/login" ? 100 : 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Handle sidebar toggle
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  // Handle sidebar auto-expand state
  const handleSidebarExpandChange = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  // Force sidebar to render except for login page
  const shouldRenderSidebar = pathname !== "/login";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background font-sans antialiased">
        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar - always render with fixed positioning and higher z-index */}
            {shouldRenderSidebar && isSidebarVisible && (
              <Sidebar 
                collapsed={isSidebarCollapsed}
                toggleCollapsed={toggleSidebar}
                className="fixed left-0 top-0 h-screen z-50"
                onExpandChange={handleSidebarExpandChange}
              />
            )}
            
            {/* Main content area */}
            <main 
              className={cn(
                "flex-1 overflow-y-auto h-screen transition-all duration-300 ease-in-out bg-muted/10", // Added subtle background
                shouldRenderSidebar && !isSidebarCollapsed && isSidebarVisible && "ml-[260px]",
                shouldRenderSidebar && isSidebarCollapsed && isSidebarVisible && "ml-[70px]",
                (!isSidebarVisible || !shouldRenderSidebar) && "ml-0",
                "p-8" // Consistent spacious padding
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }} // Added slight slide up
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full max-w-7xl mx-auto" // Center content on very large screens
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
