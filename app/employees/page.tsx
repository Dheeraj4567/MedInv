"use client"; // Add this directive

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import React, { useEffect, useState } from 'react'; // Import React hooks
import { AppLayout } from "@/components/app-layout"; // Import AppLayout

// Define interface based on API response
interface EmployeeInfo {
  employee_id: number;
  name: string;
  role: string;
  email: string;
  phone_number: string | null;
  hire_date: string | null;
  // Placeholder for status
  status?: 'Active' | 'On Leave' | 'Terminated' | 'Unknown';
}

const EmployeesPage = () => { // Changed to arrow function
  const [employees, setEmployees] = useState<EmployeeInfo[] | null>(null); // State for fetched data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeeData() {
      setError(null);
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error(`Failed to fetch employee data: ${response.statusText}`);
        }
        const data: EmployeeInfo[] = await response.json();
        if (Array.isArray(data)) {
          // Add placeholder status
          const processedData = data.map(item => ({
            ...item,
            status: 'Active' as const // Placeholder status, assume active for now
          }));
          setEmployees(processedData);
        } else {
          console.error("Received non-array data for employees:", data);
          setEmployees([]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setEmployees([]);
      }
    }

    fetchEmployeeData();
  }, []);

  // Function to determine badge color based on status (can be expanded)
  const getStatusColor = (status: string) => {
    const colors = {
      Active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      'On Leave': "bg-yellow-100 text-yellow-700 border border-yellow-200",
      Terminated: "bg-red-100 text-red-700 border border-red-200",
      Unknown: "bg-gray-100 text-gray-700 border border-gray-200",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // Wrap the content with AppLayout
  return (
    <AppLayout>
      <DashboardShell>
        <DashboardHeader heading="Employees" text="View and manage employee records.">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </DashboardHeader>
        <Card className="backdrop-blur-sm bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search employees..." className="pl-8 bg-background" />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
            {error && <p className="text-red-500 mb-4">Error: {error}</p>}
            {employees === null && <p>Loading employees...</p>}
            {employees !== null && employees.length === 0 && !error && <p>No employees found.</p>}
            {employees !== null && employees.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone_number || 'N/A'}</TableCell>
                      <TableCell>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0.5 ${getStatusColor(employee.status || 'Unknown')}`}
                        >
                          {employee.status || 'Unknown'}
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
    </AppLayout>
  )
}

export default EmployeesPage; // Add default export
