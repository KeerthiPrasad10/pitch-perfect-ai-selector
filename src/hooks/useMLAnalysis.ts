
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MLUseCase {
  title: string;
  description: string;
  category: string;
  roi: string;
  implementation: string;
  timeline: string;
  customerReferences?: string[];
}

interface MLAnalysisResult {
  useCases: MLUseCase[];
  documentContext: boolean;
  customerReferences: Array<{ name: string; industry: string }>;
}

export const useMLAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MLAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeMLUseCases = async (industry: string, customerData?: string) => {
    setLoading(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to access ML analysis');
      }

      const { data, error } = await supabase.functions.invoke('analyze-ml-usecases', {
        body: {
          industry,
          customerData,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult({
        useCases: data.useCases,
        documentContext: data.documentContext,
        customerReferences: data.customerReferences
      });

      toast({
        title: "ML Analysis Complete",
        description: `Generated ${data.useCases.length} tailored ML use cases${data.documentContext ? ' based on your uploaded documents' : ''}.`,
      });

    } catch (error) {
      console.error('Error analyzing ML use cases:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeMLUseCases,
    loading,
    result,
  };
};
