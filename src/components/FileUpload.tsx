
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileProcessed?: () => void;
}

export const FileUpload = ({ onFileProcessed }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/json'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload text, CSV, or JSON files only.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to upload files');
      }

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "File Uploaded",
        description: "File uploaded successfully. Processing...",
      });

      setUploading(false);
      setProcessing(true);

      // Process file and generate embeddings
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: {
          filePath,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Processing failed');
      }

      toast({
        title: "File Processed Successfully",
        description: `Generated ${data.chunks} embeddings for RAG search.`,
      });

      onFileProcessed?.();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Documents for RAG</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Upload text files (TXT, CSV, JSON) to enable AI-powered document search and Q&A.
          Maximum file size: 10MB.
        </div>
        
        <div className="flex items-center space-x-4">
          <Input
            type="file"
            accept=".txt,.csv,.json"
            onChange={handleFileUpload}
            disabled={uploading || processing}
            className="flex-1"
          />
          
          {(uploading || processing) && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Processing...'}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center space-x-1">
            <File className="h-3 w-3" />
            <span>Supported formats: Text (.txt), CSV (.csv), JSON (.json)</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Files are automatically vectorized for semantic search</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>Only you can access your uploaded documents</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
