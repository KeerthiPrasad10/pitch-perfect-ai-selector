
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExcelProcessorProps {
  onDataProcessed?: () => void;
}

export const ExcelProcessor = ({ onDataProcessed }: ExcelProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const processExcelFile = async () => {
    if (!file) {
      toast.error('Please select an Excel file first');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Reading Excel file...');

    try {
      // Convert file to base64 for sending to edge function
      const fileBuffer = await file.arrayBuffer();
      const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

      setProcessingStatus('Processing Excel data...');

      // Call edge function to process Excel and store in database
      const { data, error } = await supabase.functions.invoke('process-excel-mappings', {
        body: {
          fileData: base64File,
          fileName: file.name,
          contentType: file.type
        }
      });

      if (error) {
        console.error('Error processing Excel:', error);
        toast.error('Failed to process Excel file');
        return;
      }

      setProcessingStatus('Data successfully stored in database');
      toast.success(`Successfully processed ${data.recordsProcessed} records from Excel file`);
      
      if (onDataProcessed) {
        onDataProcessed();
      }

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('An error occurred while processing the Excel file');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      setFile(null);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          <span>Excel Data Processor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="excel-upload" className="block text-sm font-medium text-gray-700">
            Upload IFS Module Mapping Excel File
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="excel-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> Excel file
                </p>
                <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
              </div>
              <input
                id="excel-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </label>
          </div>
          {file && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>

        {processingStatus && (
          <div className="flex items-center space-x-2 text-sm">
            {isProcessing ? (
              <AlertCircle className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <span className={isProcessing ? 'text-blue-600' : 'text-green-600'}>
              {processingStatus}
            </span>
          </div>
        )}

        <Button
          onClick={processExcelFile}
          disabled={!file || isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Process Excel Data'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Expected columns:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Module Code</li>
            <li>Module Name</li>
            <li>Description</li>
            <li>Min Version</li>
            <li>ML Capabilities</li>
            <li>Primary Industry</li>
            <li>Release Version</li>
            <li>Base IFS Version</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
