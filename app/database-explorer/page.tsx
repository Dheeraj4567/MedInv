import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Database Explorer | Medical Inventory System',
  description: 'Explore and manage database tables in the Medical Inventory System',
}

import { DatabaseExplorerClient } from '@/components/database-explorer-client';

export default function DatabaseExplorerPage() {
  return <DatabaseExplorerClient />;
}