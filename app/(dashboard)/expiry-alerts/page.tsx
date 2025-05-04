"use client";

import React, { useEffect, useState } from 'react'; // Import React
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";

// Define the interface for an expiry alert item matching the API response
interface ExpiryAlert {
  medicine_id: number;
  medicine_name: string;
  expiry_date: string;
  quantity: number;
  days_remaining: number;
  supplier_name: string | null;
  supplier_contact_info: string | null; // Updated field name
}

const ExpiryAlertsPage = () => {
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpiryAlerts() {
      setError(null);
      try {
        const response = await fetch('/api/expiry-alerts');
        if (!response.ok) {
          let errorDetails = 'Unknown error';
          try {
            const errorData = await response.json();
            errorDetails = errorData.details || errorData.error || JSON.stringify(errorData);
          } catch (parseError) {
            errorDetails = response.statusText;
          }
          throw new Error(`Failed to fetch expiry alerts: ${response.status} ${errorDetails}`);
        }
        const data: ExpiryAlert[] = await response.json();
        if (Array.isArray(data)) {
          setExpiryAlerts(data);
        } else {
          console.error("Received non-array data for expiry alerts:", data);
          setExpiryAlerts([]);
          setError('Received invalid data format from server.');
        }
      } catch (err) {
        console.error("Error fetching expiry alerts (fetch catch block):", err);
        let errorMessage = 'An unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
          console.error("Error name:", err.name);
          console.error("Error stack:", err.stack);
        }
        setError(`Failed to fetch data: ${errorMessage}`);
        setExpiryAlerts([]);
      }
    }

    fetchExpiryAlerts();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00Z');
      return date.toLocaleDateString('en-CA');
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Expiry Alerts" text="Medicines expiring within the next 90 days." />
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Expiries</CardTitle>
          <CardDescription>List of inventory items nearing their expiry date.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          {expiryAlerts === null && !error && <p>Loading expiry alerts...</p>}
          {expiryAlerts !== null && expiryAlerts.length === 0 && !error && <p>No items expiring soon.</p>}
          {expiryAlerts !== null && expiryAlerts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Med ID</TableHead>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Days Left</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Supplier Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiryAlerts.map((alert) => (
                  <TableRow key={alert.medicine_id}>
                    <TableCell className="font-medium">{alert.medicine_id}</TableCell>
                    <TableCell>{alert.medicine_name}</TableCell>
                    <TableCell className="text-right">{alert.quantity}</TableCell>
                    <TableCell>{formatDate(alert.expiry_date)}</TableCell>
                    <TableCell className="text-right">{alert.days_remaining}</TableCell>
                    <TableCell>{alert.supplier_name || 'N/A'}</TableCell>
                    <TableCell>{alert.supplier_contact_info || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
};

export default ExpiryAlertsPage;