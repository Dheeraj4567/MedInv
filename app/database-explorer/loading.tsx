'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>
      
      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Skeleton */}
        <div className="col-span-3">
          <Card className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <div className="space-y-2">
              {Array(8).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="col-span-9">
          <Card className="p-4">
            {/* Tabs Skeleton */}
            <div className="flex border-b mb-4">
              {Array(3).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-10 w-[100px] mr-2" />
              ))}
            </div>
            
            {/* Query Editor Skeleton */}
            <Skeleton className="h-36 w-full mb-6" />
            
            {/* Results Table Skeleton */}
            <div className="space-y-2">
              <div className="flex space-x-4 mb-2">
                {Array(5).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-[150px]" />
                ))}
              </div>
              
              {Array(10).fill(null).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  {Array(5).fill(null).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-[150px]" />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}