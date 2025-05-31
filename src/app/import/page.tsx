"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, TableIcon, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// This is a simplified representation. Real CSV parsing (e.g., PapaParse) and processing would be needed.
type CSVRow = Record<string, string>;
const TRANSACTION_FIELDS = ["date", "description", "amount", "category"] as const;
type TransactionField = typeof TRANSACTION_FIELDS[number];

export default function ImportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<TransactionField, string>>({
    date: '',
    description: '',
    amount: '',
    category: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // Simulate CSV parsing for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const fileHeaders = lines[0].split(',').map(h => h.trim());
        setHeaders(fileHeaders);
        const data = lines.slice(1, 6).map(line => { // Preview first 5 rows
          const values = line.split(',').map(v => v.trim());
          return fileHeaders.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {} as CSVRow);
        });
        setCsvData(data.filter(row => Object.values(row).some(val => val))); // Filter out empty rows
      };
      reader.readAsText(file);
    }
  };

  const handleMappingChange = (field: TransactionField, csvHeader: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: csvHeader }));
  };

  const handleImport = async () => {
    if (!csvFile || Object.values(columnMapping).some(val => !val)) {
      alert("Please select a file and map all columns.");
      return;
    }
    setIsProcessing(true);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    console.log("Importing with mapping:", columnMapping);
    // In a real app, you'd parse the full CSV, transform data based on mapping, and save transactions.
    alert("Transactions imported successfully (simulated).");
    setIsProcessing(false);
    // Reset state or navigate
    setCsvFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({ date: '', description: '', amount: '', category: '' });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Import Transactions"
        description="Upload a CSV file to add multiple transactions at once."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>Select your CSV file and map the columns to the required transaction fields.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="csv-upload" className="mb-2 block">Choose CSV File</Label>
            <div className="flex items-center gap-2">
              <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="max-w-sm"/>
              {csvFile && <p className="text-sm text-muted-foreground">{csvFile.name}</p>}
            </div>
          </div>

          {headers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Map Columns</h3>
              <p className="text-sm text-muted-foreground">
                Match the columns from your CSV file to the Synapse Finance fields.
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

          {csvData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-lg">CSV Preview (First 5 rows)</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>{headers.map(h => <th key={h} className="p-2 text-left font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b last:border-b-0">
                        {headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <Button onClick={handleImport} disabled={!csvFile || isProcessing || Object.values(columnMapping).some(val => !val)}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Import Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
