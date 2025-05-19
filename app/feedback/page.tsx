'use client'; // Add the "use client" directive

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import React, { useEffect, useState } from 'react'; // Import React hooks
import { AppLayout } from "@/components/app-layout"; // Import AppLayout component

// Define interface based on API response
interface FeedbackInfo {
  feedback_id: number;
  patient_id: number;
  patient_name: string;
  ratings: number | null;
  // Placeholder fields
  date?: string;
  comment?: string;
  status?: 'Reviewed' | 'Pending' | 'Unknown';
}

const FeedbackPage = () => { // Changed to arrow function
  const [feedbacks, setFeedbacks] = useState<FeedbackInfo[] | null>(null); // State for fetched data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedbackData() {
      setError(null);
      try {
        const response = await fetch('/api/feedback');
        if (!response.ok) {
          throw new Error(`Failed to fetch feedback data: ${response.statusText}`);
        }
        const data: FeedbackInfo[] = await response.json();
        if (Array.isArray(data)) {
          // Add placeholder data
          const processedData = data.map(item => ({
            ...item,
            date: 'N/A', // Placeholder
            comment: 'N/A', // Placeholder - API needs update
            status: 'Unknown' as const // Placeholder
          }));
          setFeedbacks(processedData);
        } else {
          console.error("Received non-array data for feedback:", data);
          setFeedbacks([]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setFeedbacks([]);
      }
    }

    fetchFeedbackData();
  }, []);

  const getRatingColor = (rating: number | null) => {
    if (rating === null || rating === undefined) return "bg-gray-100 text-gray-700 border border-gray-200";
    if (rating >= 4) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    if (rating >= 3) return "bg-yellow-100 text-yellow-700 border border-yellow-200"; // Changed amber to yellow for variety
    return "bg-red-100 text-red-700 border border-red-200";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Reviewed: "bg-blue-100 text-blue-700 border border-blue-200",
      Pending: "bg-orange-100 text-orange-700 border border-orange-200", // Changed amber to orange
      Unknown: "bg-gray-100 text-gray-700 border border-gray-200",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  return (
    <AppLayout>
      <DashboardShell>
        <DashboardHeader heading="Feedback" text="View and manage patient feedback.">
          <Button variant="outline">Generate Report</Button>
        </DashboardHeader>
        <Card className="backdrop-blur-sm bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search feedback..." className="pl-8 bg-background" />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
            {error && <p className="text-red-500 mb-4">Error: {error}</p>}
            {feedbacks === null && <p>Loading feedback...</p>}
            {feedbacks !== null && feedbacks.length === 0 && !error && <p>No feedback found.</p>}
            {feedbacks !== null && feedbacks.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Feedback ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="w-[300px]">Comment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.feedback_id}>
                      <TableCell className="font-medium">{feedback.feedback_id}</TableCell>
                      <TableCell>{feedback.patient_name}</TableCell>
                      <TableCell>{feedback.date}</TableCell> {/* Placeholder */}
                      <TableCell>
                        <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getRatingColor(feedback.ratings)}`}>
                          {feedback.ratings !== null ? `${feedback.ratings}/5` : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={feedback.comment}>
                        {feedback.comment} {/* Placeholder */}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getStatusColor(feedback.status || 'Unknown')}`}>
                          {feedback.status || 'Unknown'}
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

export default FeedbackPage; // Add default export
