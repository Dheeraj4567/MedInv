'use client';

import { useEffect, useState } from 'react';

/**
 * DeploymentModeIndicator component
 * 
 * Displays a visual indicator of the current deployment mode:
 * - Demo Mode: Data resets on refresh
 * - Local Mode: Local MySQL database
 * - Production Mode: PlanetScale/cloud database
 */
export function DeploymentModeIndicator() {
  // Start with unknown mode until we can fetch it from the server
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the deployment mode from the API
    async function fetchDeploymentMode() {
      try {
        const response = await fetch('/api/deployment-mode');
        const data = await response.json();
        setMode(data.mode);
      } catch (error) {
        console.error('Failed to fetch deployment mode:', error);
        setMode('unknown');
      }
    }

    fetchDeploymentMode();
  }, []);

  if (!mode) return null;

  // Define badge styles based on deployment mode
  const getBadgeStyle = () => {
    switch (mode) {
      case 'demo':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'local':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planetscale':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get readable mode label
  const getModeLabel = () => {
    switch (mode) {
      case 'demo':
        return 'Demo Mode';
      case 'local':
        return 'Local Mode';
      case 'planetscale':
        return 'Production Mode';
      default:
        return 'Unknown Mode';
    }
  };

  // Get badge description
  const getBadgeDescription = () => {
    switch (mode) {
      case 'demo':
        return 'Data resets on page refresh';
      case 'local':
        return 'Using local MySQL database';
      case 'planetscale':
        return 'Using cloud database';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={`rounded-md px-2 py-1 text-xs font-medium border ${getBadgeStyle()}`}
        title={getBadgeDescription()}
      >
        {getModeLabel()}
      </div>
    </div>
  );
}
