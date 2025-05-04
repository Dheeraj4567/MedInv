'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Database, Table as TableIcon, FileSpreadsheet, Download,
  Search, ChevronDown, Save, RotateCw,
  Copy, Trash2, Zap, X, Code2, Eraser, AlertCircle
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added this line

import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Import table data directly from the JSON file (adjust path if needed)
import dbSchema from '@/context-db.json'; // Assuming context-db.json is in the root or accessible path

// Interface definitions (simplified)
interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

// Extract table names and add placeholder counts based on image/context
const databaseTables = Object.keys(dbSchema.tables).map(tableName => {
  let count = 0; // Default count - All tables will show 0 initially
  // Removed the hardcoded placeholder counts based on OCR
  return { name: tableName, count };
});

// Mock saved queries (can be replaced with actual implementation)
const mockSavedQueries: SavedQuery[] = [
  { id: "1", name: "Expired Medicines", query: "SELECT * FROM Medicine WHERE expiry_date < CURRENT_DATE", createdAt: "2025-01-15" },
  { id: "2", name: "Low Stock Items", query: "SELECT * FROM Medicine WHERE stock < 10", createdAt: "2025-02-10" },
];

// API call function (remains the same)
const executeQuery = async (query: string): Promise<QueryResult> => {
  console.log("Executing query:", query);
  try {
    const response = await fetch('/api/database-explorer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to execute query');
    }
    const data = await response.json();
    const rows = data.result;
    if (!Array.isArray(rows) || rows.length === 0) {
      // Check if it was a non-SELECT statement that succeeded
      if (data.message && data.message.includes("successfully")) {
         return { columns: ['Result'], rows: [{ Result: data.message }] };
      }
      return { columns: ['Result'], rows: [{ Result: 'Query executed successfully. No results to display.' }] };
    }
    const firstRow = rows[0];
    const columns = Object.keys(firstRow);
    return { columns, rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(error instanceof Error ? error.message : 'An error occurred while executing the query');
  }
};


export function DatabaseExplorer({ initialSelectedTable }: { initialSelectedTable?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [selectedTable, setSelectedTable] = useState<string>(initialSelectedTable || databaseTables[0]?.name || "");
  const [tables, setTables] = useState(databaseTables); // Use data from JSON
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false); // Initially false as we load statically
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(mockSavedQueries);
  const [newQueryName, setNewQueryName] = useState('');
  const [isSavingQuery, setIsSavingQuery] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsLimit, setResultsLimit] = useState<string>("10");
  const [queryError, setQueryError] = useState<string | null>(null);

  // Refs
  const queryTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Set initial query when table changes
  useEffect(() => {
    if (selectedTable) {
      const defaultQuery = `SELECT * FROM ${selectedTable} LIMIT ${resultsLimit};`;
      setQueryInput(defaultQuery);
      // Optionally auto-run the query for the selected table
      // executeQueryWrapper(defaultQuery); 
       // Update URL without reload
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('table', selectedTable);
      router.replace(`/database-explorer?${params.toString()}`, { scroll: false });
    }
  }, [selectedTable, resultsLimit, router, searchParams]); // Added dependencies

  // Handle exit
  const handleExit = () => {
    router.back(); // Go back to the previous page
  };

  // Filter tables
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(tableSearchTerm.toLowerCase())
  );

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setError(null);
    setQueryResults(null); // Clear previous results
    setQueryError(null);
  };

  // Wrapper for executeQuery to handle state and errors
  const executeQueryWrapper = useCallback(async (queryToRun: string) => { // Added useCallback
    if (!queryToRun.trim()) {
      toast({ title: "Query Empty", description: "Please enter a query.", variant: "destructive" });
      return;
    }
    setIsExecutingQuery(true);
    setQueryError(null);
    setError(null);
    try {
      const result = await executeQuery(queryToRun);
      setQueryResults(result);
      if (!queryToRun.trim().toLowerCase().startsWith('select')) {
         toast({ title: "Query Executed", description: "Your non-SELECT query ran successfully.", variant: "default" });
      }
    } catch (err: any) {
      setQueryError(err.message || 'An error occurred');
      setQueryResults(null);
      toast({ title: "Query Error", description: err.message, variant: "destructive" });
    } finally {
      setIsExecutingQuery(false);
    }
  }, [toast]); // Added dependencies

  // Execute button handler
  const handleExecuteClick = () => {
    executeQueryWrapper(queryInput);
  };

  // Save current query
  const saveCurrentQuery = () => {
    if (!queryInput.trim() || !newQueryName.trim()) {
      toast({ title: "Error", description: "Please enter a query and a name to save.", variant: "destructive" });
      return;
    }
    setIsSavingQuery(true);
    // Mock saving
    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name: newQueryName,
      query: queryInput,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSavedQueries(prev => [...prev, newQuery]);
    setShowSaveDialog(false);
    setNewQueryName('');
    setIsSavingQuery(false);
    toast({ title: "Query Saved", description: `"${newQueryName}" saved successfully.`, variant: "default" });
  };

  // Export results
  const exportResults = (format: 'csv' | 'json') => {
    if (!queryResults || !queryResults.rows || queryResults.rows.length === 0) {
       toast({ title: "No Data", description: "No results to export.", variant: "destructive" });
       return;
    }
    try {
      let content = '';
      let filename = `query_export_${selectedTable}_${new Date().toISOString().split('T')[0]}`;
      let mime = '';

      if (format === 'csv') {
        content = queryResults.columns.join(',') + '\n';
        content += queryResults.rows.map(row => 
          queryResults.columns.map(col => {
            let val = row[col] ?? '';
            // Escape quotes and handle commas within values
            const escapedVal = typeof val === 'string' ? val.replace(/"/g, '""') : val;
            return typeof val === 'string' && val.includes(',') ? `"${escapedVal}"` : escapedVal;
          }).join(',')
        ).join('\n');
        mime = 'text/csv;charset=utf-8;'; // Added charset
        filename += '.csv';
      } else { // JSON
        content = JSON.stringify(queryResults.rows, null, 2); // Export only rows as JSON array
        mime = 'application/json;charset=utf-8;'; // Added charset
        filename += '.json';
      }
      
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: `Data exported as ${format.toUpperCase()}.`, variant: "default" });
    } catch (err: any) {
      toast({ title: "Export Error", description: err.message || `Failed to export as ${format.toUpperCase()}.`, variant: "destructive" });
    }
  };

  // Clear query input
  const clearQueryInput = () => {
    setQueryInput('');
    setQueryError(null);
    // setQueryResults(null); // Optionally clear results too
    if (queryTextareaRef.current) {
      queryTextareaRef.current.focus();
    }
  };

  // Format cell value
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">NULL</span>;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    // Basic date check (can be improved)
    if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      try {
        return new Date(value).toLocaleString();
      } catch (e) { /* ignore */ }
    }
    if (value instanceof Date) return value.toLocaleString(); // Use locale string
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 bg-background">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Database Explorer</h1>
            <p className="text-sm text-muted-foreground">
              Explore, query, and analyze your medical inventory database
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExit}>
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
            <Button variant="outline" size="sm" onClick={handleExecuteClick} disabled={isExecutingQuery || !queryInput.trim()}>
              <Zap className="mr-1 h-4 w-4" /> Run Query
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} disabled={!queryInput.trim()}>
              <Save className="mr-1 h-4 w-4" /> Save Query
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!queryResults || !queryResults.rows || queryResults.rows.length === 0}>
                  <Download className="mr-1 h-4 w-4" /> Export <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportResults('csv')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportResults('json')}>
                  <Code2 className="mr-2 h-4 w-4" /> Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 overflow-hidden">

          {/* Left Sidebar Column: Replace Card structure with simple divs */} 
          <div className="md:col-span-3 lg:col-span-3 flex flex-col h-full bg-card rounded-lg border overflow-hidden">
             {/* Header Section (mimicking CardHeader) */}
             <div className="pb-3 px-4 pt-4 border-b">
                <h3 className="text-base font-medium flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Database Tables
                </h3>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tables..."
                    value={tableSearchTerm}
                    onChange={(e) => setTableSearchTerm(e.target.value)}
                    className="pl-8 text-sm h-9"
                  />
                </div>
              </div>
              {/* Content Section (mimicking CardContent) */}
              {/* Use flex-1 and overflow-y-auto */}
              <div className="flex-1 overflow-y-auto p-2">
                 <div className="space-y-1">
                  {isLoadingTables ? (
                    <> 
                      <Skeleton className="h-8 w-full mb-1" />
                      <Skeleton className="h-8 w-full mb-1" />
                      <Skeleton className="h-8 w-full mb-1" />
                      <Skeleton className="h-8 w-full mb-1" />
                      <Skeleton className="h-8 w-full mb-1" />
                    </>
                  ) : filteredTables.length > 0 ? (
                    filteredTables.map((table) => (
                      <Button
                        key={table.name}
                        variant={selectedTable === table.name ? "secondary" : "ghost"} 
                        className={cn(
                          "w-full justify-start group py-2 px-3 h-auto text-sm",
                          selectedTable === table.name && "bg-yellow-400 hover:bg-yellow-500 text-black"
                        )}
                        onClick={() => handleTableSelect(table.name)}
                      >
                        <TableIcon className="mr-2 h-4 w-4" />
                        <span className="truncate flex-1">{table.name}</span>
                        <Badge 
                          variant={selectedTable === table.name ? "default" : "secondary"} 
                          className={cn(
                            "ml-2 text-xs px-1.5 py-0.5 h-5",
                             selectedTable === table.name && "bg-black/70 text-white"
                          )}
                        >
                          {table.count}
                        </Badge>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No tables found matching "{tableSearchTerm}"
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9 lg:col-span-9 flex flex-col h-full gap-4">
            {/* SQL Editor Card */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  SQL Editor
                  {isExecutingQuery && <RotateCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                 <Textarea
                    ref={queryTextareaRef}
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="SELECT * FROM your_table WHERE condition = 'value';"
                    className="font-mono text-sm h-[150px] md:h-[180px] resize-y p-3 rounded-md bg-muted/30 border border-border focus-visible:ring-1 focus-visible:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleExecuteClick();
                      }
                    }}
                    disabled={isExecutingQuery}
                  />
                <div className="flex justify-end items-center mt-3 gap-2">
                   <div className="flex items-center mr-auto">
                      <span className="text-sm mr-2 text-muted-foreground">Limit:</span>
                      <Select value={resultsLimit} onValueChange={setResultsLimit}>
                        <SelectTrigger className="w-20 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <Button variant="ghost" size="sm" onClick={clearQueryInput} disabled={!queryInput.trim() || isExecutingQuery}>
                    <Eraser className="mr-1 h-4 w-4" /> Clear
                  </Button>
                  <Button variant="default" size="sm" onClick={handleExecuteClick} disabled={isExecutingQuery || !queryInput.trim()}>
                     {isExecutingQuery ? <RotateCw className="mr-1 h-4 w-4 animate-spin" /> : <Zap className="mr-1 h-4 w-4" />}
                     Execute
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Query Results Card */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-base font-medium">Query Results</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                 {queryError && (
                    <div className="p-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Query Error</AlertTitle>
                        <AlertDescription className="font-mono text-xs whitespace-pre-wrap">
                          {queryError}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                 {isExecutingQuery && !queryResults && ( 
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-[80%]" />
                    </div>
                  )}
                 {queryResults && queryResults.rows.length > 0 && (
                    <ScrollArea className="h-full">
                      <Table className="text-sm">
                        <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                          <TableRow>
                            {queryResults.columns.map((col) => (
                              <TableHead key={col} className="whitespace-nowrap px-3 py-2 h-10">{col}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResults.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {queryResults.columns.map((col) => (
                                <TableCell key={`${rowIndex}-${col}`} className="whitespace-nowrap px-3 py-1.5 align-top">
                                  <div className="max-w-[300px] max-h-[100px] overflow-auto text-xs"> 
                                    {formatCellValue(row[col])}
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                  {queryResults && queryResults.rows.length === 0 && !queryError && !isExecutingQuery && (
                     <div className="p-4 text-center text-muted-foreground">
                       Query executed successfully. No results to display.
                     </div>
                  )}
                   {!queryResults && !isExecutingQuery && !queryError && (
                     <div className="p-4 text-center text-muted-foreground">
                       Run a query to see results here.
                     </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Query Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Query</DialogTitle>
              <DialogDescription>
                Enter a name for your query to save it for later use.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="Query name (e.g., 'Low Stock Items')" 
                value={newQueryName}
                onChange={(e) => setNewQueryName(e.target.value)}
                disabled={isSavingQuery}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)} disabled={isSavingQuery}>Cancel</Button>
              <Button onClick={saveCurrentQuery} disabled={isSavingQuery || !newQueryName.trim()}>
                {isSavingQuery ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}