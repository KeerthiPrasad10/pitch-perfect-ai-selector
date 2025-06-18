
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { RAGQuery } from "@/components/RAGQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Database, Zap } from "lucide-react";

const RAG = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileProcessed = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <span>RAG (Retrieval Augmented Generation)</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your documents and ask questions about them. AI will search through your files 
            and provide accurate answers based on the content.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Vector Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Your documents are automatically converted to vector embeddings for semantic search
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Smart Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Find relevant information using natural language queries, not just keyword matching
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Get comprehensive answers generated from your document content with source citations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FileUpload onFileProcessed={handleFileProcessed} />
          </div>
          
          <div className="space-y-6">
            <RAGQuery key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAG;
