'use client';

import { useSearchParams } from 'next/navigation';
import { DatabaseExplorer } from './database-explorer';

export function DatabaseExplorerClient() {
  const searchParams = useSearchParams();
  const table = searchParams.get('table');

  return <DatabaseExplorer initialSelectedTable={table || undefined} />;
}