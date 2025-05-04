"use client";

import React, { useEffect, useState } from 'react';
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
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";

interface MedicalLog {
  record_id: number;
  patient_id: number;
  log_date: string;
}

const MedicalLogsPage = () => {
  const [medicalLogs, setMedicalLogs] = useState<MedicalLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicalLogs() {
      setError(null);
      try {
        const response = await fetch('/api/medical-logs');
        if (!response.ok) {
          throw new Error(`Failed to fetch medical logs: ${response.statusText}`);
        }
        const data: MedicalLog[] = await response.json();
        if (Array.isArray(data)) {
          setMedicalLogs(data);
        } else {
          console.error("Received non-array data for medical logs:", data);
          setMedicalLogs([]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setMedicalLogs([]);
      }
    }

    fetchMedicalLogs();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Medical Logs" text="View patient medical log entries." />
      <Card>
        <CardHeader>
          <CardTitle>Medical Log History</CardTitle>
          <CardDescription>List of all recorded medical logs.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          {medicalLogs === null && <p>Loading medical logs...</p>}
          {medicalLogs !== null && medicalLogs.length === 0 && !error && <p>No medical logs found.</p>}
          {medicalLogs !== null && medicalLogs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Record ID</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Log Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalLogs.map((log) => (
                  <TableRow key={log.record_id}>
                    <TableCell className="font-medium">{log.record_id}</TableCell>
                    <TableCell>{log.patient_id}</TableCell>
                    <TableCell>{formatDate(log.log_date)}</TableCell>
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

export default MedicalLogsPage;