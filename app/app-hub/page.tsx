import { Metadata } from 'next';
import { AppHubClient } from '../../components/app-hub-client';

export const metadata: Metadata = {
  title: 'Medical Inventory | App Hub',
  description: 'Access all your medical inventory applications in one place',
};

export default function AppHubPage() {
  return <AppHubClient />;
}