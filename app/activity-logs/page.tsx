"use client";

import React from 'react';
import { AppLayout } from "@/components/app-layout";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { RecentActivity } from "@/components/recent-activity";

export default function ActivityLogsPage() {
  return (
    <AppLayout>
      <DashboardShell>
        <DashboardHeader 
          heading="Activity Logs" 
          text="View all recent activity across your medical inventory system."
        />
        
        <div className="grid gap-6">
          <RecentActivity />
        </div>
      </DashboardShell>
    </AppLayout>
  );
}