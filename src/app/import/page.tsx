
"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, Loader2 } from 'lucide-react'; // Replaced TableIcon with FileText
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // For notifications

type ParsedRow = Record<string, string>;
const TRANSACTION_FIELDS = ["date", "description", "amount", "category"] as const;
type TransactionField = typeof TRANSACTION_FIELDS[number];

export default function ImportPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'pdf' | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<TransactionField, string>>({
    date: '',
    description: '',
    amount: '',
    category: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const name = selectedFile.name.toLowerCase();
      if (name.endsWith('.csv')) {
        setFileType('csv');
        parseCsv(selectedFile);
      } else if (name.endsWith('.pdf')) {
        setFileType('pdf');
        // PDF parsing is complex and would typically be handled here or by a backend.
        // For now, we'll just acknowledge the file type.
        setParsedData([]); // Clear previous CSV data if any
        setHeaders([]); // Clear headers
        toast({ title: "PDF Selected", description: "PDF parsing is a placeholder. Map columns if applicable, or proceed with simulated import." });
      } else {
        setFileType(null);
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload a CSV or PDF file." });
      }
    }
  };

  const parseCsv = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== ''); // Filter empty lines
      if (lines.length === 0) {
        toast({variant: "destructive", title: "Empty CSV", description: "The CSV file appears to be empty."});
        setHeaders([]);
        setParsedData([]);
        return;
      }
      const fileHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Trim and remove quotes
      setHeaders(fileHeaders);
      const data = lines.slice(1, 6).map(line => { // Preview first 5 data rows
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        return fileHeaders.reduce((obj, header, index) => {
          obj[header] = values[index] || ''; // Ensure value exists
          return obj;
        }, {} as ParsedRow);
      });
      setParsedData(data.filter(row => Object.values(row).some(val => val))); 
    };
    reader.readAsText(csvFile);
  };


  const handleMappingChange = (field: TransactionField, csvHeader: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: csvHeader }));
  };

  const handleImport = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "No File", description: "Please select a file to import." });
      return;
    }
    if (fileType === 'csv' && Object.values(columnMapping).some(val => !val)) {
      toast({ variant: "destructive", title: "Mapping Incomplete", description: "Please map all columns for CSV import." });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    if (fileType === 'csv') {
      console.log("Importing CSV with mapping:", columnMapping);
      // In a real app, you'd parse the full CSV, transform data based on mapping, and save transactions.
      toast({ title: "CSV Import Successful (Simulated)", description: "Your transactions have been processed." });
    } else if (fileType === 'pdf') {
      console.log("Importing PDF:", file.name);
      // In a real app, PDF processing logic would go here.
      toast({ title: "PDF Import Initiated (Simulated)", description: "PDF processing is a placeholder." });
    }
    
    setIsProcessing(false);
    // Reset state
    setFile(null);
    setFileType(null);
    setParsedData([]);
    setHeaders([]);
    setColumnMapping({ date: '', description: '', amount: '', category: '' });
    // Clear file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const isImportDisabled = !file || isProcessing || (fileType === 'csv' && Object.values(columnMapping).some(val => !val));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Import Transactions"
        description="Upload a CSV or PDF file to add multiple transactions at once."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Select your CSV or PDF file. For CSVs, map columns to transaction fields.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="file-upload" className="mb-2 block">Choose File</Label>
            <div className="flex items-center gap-3">
              <Input id="file-upload" type="file" accept=".csv,.pdf" onChange={handleFileChange} className="max-w-sm"/>
              {file && <p className="text-sm text-muted-foreground flex items-center gap-1"> <FileText className="h-4 w-4" /> {file.name} ({fileType?.toUpperCase()})</p>}
            </div>
          </div>

          {fileType === 'csv' && headers.length > 0 && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <h3 className="font-medium text-lg">Map CSV Columns</h3>
              <p className="text-sm text-muted-foreground">
                Match columns from your CSV to Synapse Finance fields.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRANSACTION_FIELDS.map(field => (
                  <div key={field} className="space-y-1">
                    <Label htmlFor={`map-${field}`} className="capitalize">{field}</Label>
                    <Select 
                      value={columnMapping[field]} 
                      onValueChange={(value) => handleMappingChange(field, value)}
                    >
                      <SelectTrigger id={`map-${field}`}>
                        <SelectValue placeholder={`Select CSV column for ${field}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fileType === 'csv' && parsedData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-lg">CSV Preview (First 5 data rows)</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>{headers.map(h => <th key={h} className="p-2 text-left font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-b-0">
                        {headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

           {fileType === 'pdf' && (
            <div className="p-4 border rounded-md bg-muted/20 text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
              <h3 className="font-medium text-lg">PDF File Selected</h3>
              <p className="text-sm text-muted-foreground">
                PDF processing is currently a placeholder. For now, you can simulate the import.
                Full PDF data extraction will be available in a future update.
              </p>
            </div>
          )}
          
          <div className="pt-4">
            <Button onClick={handleImport} disabled={isImportDisabled}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Import Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
