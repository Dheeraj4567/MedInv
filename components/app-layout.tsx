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
  const pathname = usePathname();

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setIsSidebarCollapsed(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error);
    }
  }, []);

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
    const timer = setTimeout(() => setIsLoading(false), pathname === "/login" ? 100 : 300);
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
            {/* Sidebar - always render with fixed positioning */}
            {shouldRenderSidebar && (
              <Sidebar 
                collapsed={isSidebarCollapsed}
                toggleCollapsed={toggleSidebar}
                className="fixed left-0 top-0 h-screen z-30"
                onExpandChange={handleSidebarExpandChange}
              />
            )}
            
            {/* Main content area */}
            <main 
              className={cn(
                "flex-1 overflow-y-auto h-screen transition-all duration-300 ease-in-out",
                shouldRenderSidebar && !isSidebarCollapsed && "ml-[260px]",
                shouldRenderSidebar && isSidebarCollapsed && "ml-[70px]",
                "pt-2 pb-10 px-6" // Reduced top padding to bring the table closer to the heading
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
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
