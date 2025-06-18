
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, MessageSquare, FileText, Loader2 } from "lucide-react";

interface RAGQueryProps {
  className?: string;
}

interface QueryResult {
  answer: string;
  sources: Array<{
    file_name: string;
    similarity: number;
    chunk_text: string;
  }>;
}

export const RAGQuery = ({ className }: RAGQueryProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const { toast } = useToast();

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to search documents');
      }

      const { data, error } = await supabase.functions.invoke('rag-query', {
        body: {
          query: query.trim(),
          maxResults: 5,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Query failed');
      }

      setResult({
        answer: data.answer,
        sources: data.sources || [],
      });

    } catch (error) {
      console.error('Error querying documents:', error);
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleQuery();
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Ask Your Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Ask a question about your uploaded documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleQuery}
              disabled={!query.trim() || loading}
              className="px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Answer</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-blue-800 leading-relaxed">{result.answer}</p>
                </CardContent>
              </Card>

              {result.sources.length > 0 && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Sources ({result.sources.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {result.sources.map((source, index) => (
                      <div key={index} className="border-l-2 border-gray-300 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {source.file_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round(source.similarity * 100)}% match
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{source.chunk_text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
