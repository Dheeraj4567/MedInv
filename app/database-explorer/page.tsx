import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Database Explorer | Medical Inventory System',
  description: 'Explore and manage database tables in the Medical Inventory System',
}

import { DatabaseExplorerClient } from '@/components/database-explorer-client';

export default function DatabaseExplorerPage() {
  return (
    <Suspense fallback={<div className="p-6 space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-12 gap-6 h-[600px]">
        <Skeleton className="col-span-3 h-full" />
        <Skeleton className="col-span-9 h-full" />
      </div>
    </div>}>
      <DatabaseExplorerClient />
    </Suspense>
  );
}