'use client'; // Add the "use client" directive

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from 'react'; // Import React hooks

// Define interface matching the API response (basic for now)
interface BillingInfo {
  billing_id: number;
  patient_id: number;
  patient_name: string;
  invoice: string;
  // Placeholder fields until API is enhanced
  date?: string;
  amount?: string;
  discount?: string;
  total?: string;
  status?: 'Paid' | 'Pending' | 'Overdue' | 'Unknown'; // Add 'Unknown'
}

const BillingPage = () => { // Changed to arrow function
  const [billings, setBillings] = useState<BillingInfo[] | null>(null); // State for fetched data
  const [error, setError] = useState<string | null>(null);
  // Keep search/filter state if needed later
  // const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    async function fetchBillingData() {
      setError(null);
      try {
        const response = await fetch('/api/billing');
        if (!response.ok) {
          throw new Error(`Failed to fetch billing data: ${response.statusText}`);
        }
        const data: BillingInfo[] = await response.json();
        if (Array.isArray(data)) {
          // Add placeholder data for missing fields
          const processedData = data.map(item => ({
            ...item,
            date: 'N/A', // Placeholder
            amount: 'N/A', // Placeholder
            discount: 'N/A', // Placeholder
            total: 'N/A', // Placeholder
            status: 'Unknown' as const // Placeholder
          }));
          setBillings(processedData);
        } else {
          console.error("Received non-array data for billing:", data);
          setBillings([]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setBillings([]);
      }
    }

    fetchBillingData();
  }, []);


  const getStatusColor = (status: string) => {
    const colors = {
      Paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Pending: "bg-amber-100 text-amber-700 border border-amber-200",
      Overdue: "bg-red-100 text-red-700 border border-red-200",
      Unknown: "bg-gray-100 text-gray-700 border border-gray-200", // Style for Unknown
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Billing" text="View and manage patient billing records.">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </DashboardHeader>
      <Card className="backdrop-blur-sm bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search billing records..." className="pl-8 bg-background" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          {billings === null && <p>Loading billing records...</p>}
          {billings !== null && billings.length === 0 && !error && <p>No billing records found.</p>}
          {billings !== null && billings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Billing ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billings.map((billing) => (
                  <TableRow key={billing.billing_id}>
                    <TableCell className="font-medium">{billing.billing_id}</TableCell>
                    <TableCell>{billing.patient_name}</TableCell>
                    <TableCell>{billing.invoice}</TableCell>
                    <TableCell>{billing.date}</TableCell>
                    <TableCell>{billing.amount}</TableCell>
                    <TableCell>{billing.discount}</TableCell>
                    <TableCell>{billing.total}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getStatusColor(billing.status || 'Unknown')}`}>
                        {billing.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

export default BillingPage; // Add default export
