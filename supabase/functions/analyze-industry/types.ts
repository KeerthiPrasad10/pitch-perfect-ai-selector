
export interface CompanyDetails {
  formalName: string;
  description: string;
  revenue: string | null;
  employees: string | null;
  businessModel: string | null;
  keyProducts: string | null;
  ifsVersion?: string;
  customerSince?: string;
}

export interface RelatedIndustry {
  industry: string;
  relevance: 'primary' | 'secondary' | 'tertiary';
  reasoning: string;
  useCases: string[];
  description: string;
}

export interface DocumentUseCase {
  title: string;
  description: string;
  category: string;
  roi: string;
  implementation: string;
  timeline: string;
  source: string;
  isFromDocuments: boolean;
  sources: Array<{
    file_name: string;
    similarity: number;
  }>;
}

export interface CustomerAnalysis {
  customerType: 'customer' | 'prospect' | 'unknown';
  industry: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  currentUseCases: string[];
  documentBasedUseCases: DocumentUseCase[];
  suggestedCompanies: Array<{
    name: string;
    industry: string;
    isIFSCustomer: boolean;
  }>;
  relatedIndustries: RelatedIndustry[];
  companyDetails: CompanyDetails;
}
