
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Check } from "lucide-react";

interface CustomerInputProps {
  onIndustrySelected: (industry: string, customerName: string) => void;
}

export const CustomerInput = ({ onIndustrySelected }: CustomerInputProps) => {
  const [customerName, setCustomerName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [identifiedIndustries, setIdentifiedIndustries] = useState<string[]>([]);
  const [showIndustrySelection, setShowIndustrySelection] = useState(false);

  // Mock AI industry identification - in real implementation this would call an AI service
  const identifyIndustries = async (companyName: string) => {
    setIsSearching(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock industry identification based on company name patterns
    const mockIndustryMapping: { [key: string]: string[] } = {
      "hospital": ["healthcare"],
      "medical": ["healthcare"],
      "health": ["healthcare"],
      "bank": ["finance"],
      "financial": ["finance"],
      "capital": ["finance"],
      "store": ["retail"],
      "shop": ["retail"],
      "market": ["retail"],
      "tech": ["technology"],
      "software": ["technology"],
      "systems": ["technology"],
      "manufacturing": ["manufacturing"],
      "motors": ["automotive"],
      "auto": ["automotive"],
      "energy": ["energy"],
      "power": ["energy"],
      "hotel": ["hospitality"],
      "resort": ["hospitality"],
      "school": ["education"],
      "university": ["education"],
      "college": ["education"]
    };

    const lowerName = companyName.toLowerCase();
    let industries: string[] = [];
    
    for (const [keyword, industryList] of Object.entries(mockIndustryMapping)) {
      if (lowerName.includes(keyword)) {
        industries = [...industries, ...industryList];
      }
    }
    
    // If no specific match, provide some common options
    if (industries.length === 0) {
      industries = ["technology", "finance", "healthcare"];
    }
    
    // Remove duplicates
    industries = [...new Set(industries)];
    
    setIdentifiedIndustries(industries);
    setShowIndustrySelection(true);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (customerName.trim()) {
      identifyIndustries(customerName);
    }
  };

  const handleIndustrySelect = (industry: string) => {
    onIndustrySelected(industry, customerName);
    setShowIndustrySelection(false);
    setIdentifiedIndustries([]);
  };

  const industryLabels: { [key: string]: string } = {
    "healthcare": "Healthcare & Life Sciences",
    "finance": "Financial Services",
    "retail": "Retail & E-commerce",
    "manufacturing": "Manufacturing",
    "technology": "Technology & Software",
    "automotive": "Automotive",
    "energy": "Energy & Utilities",
    "education": "Education",
    "government": "Government & Public Sector",
    "logistics": "Logistics & Supply Chain",
    "media": "Media & Entertainment",
    "insurance": "Insurance",
    "real-estate": "Real Estate",
    "agriculture": "Agriculture",
    "hospitality": "Hospitality & Travel"
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span>Customer Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter customer/company name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-base"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={!customerName.trim() || isSearching}
            className="px-6"
          >
            {isSearching ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {showIndustrySelection && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              AI identified the following industries for "{customerName}":
            </div>
            <div className="flex flex-wrap gap-2">
              {identifiedIndustries.map((industry) => (
                <Button
                  key={industry}
                  variant="outline"
                  size="sm"
                  onClick={() => handleIndustrySelect(industry)}
                  className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Check className="h-4 w-4" />
                  <span>{industryLabels[industry] || industry}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Select the most relevant industry to see tailored AI use cases
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
