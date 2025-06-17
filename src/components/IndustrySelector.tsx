
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IndustrySelectorProps {
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
}

const industries = [
  { value: "", label: "All Industries" },
  { value: "healthcare", label: "Healthcare & Life Sciences" },
  { value: "finance", label: "Financial Services" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "technology", label: "Technology & Software" },
  { value: "automotive", label: "Automotive" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "education", label: "Education" },
  { value: "government", label: "Government & Public Sector" },
  { value: "logistics", label: "Logistics & Supply Chain" },
  { value: "media", label: "Media & Entertainment" },
  { value: "insurance", label: "Insurance" },
  { value: "real-estate", label: "Real Estate" },
  { value: "agriculture", label: "Agriculture" },
  { value: "hospitality", label: "Hospitality & Travel" }
];

export const IndustrySelector = ({ selectedIndustry, onIndustryChange }: IndustrySelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Target Industry</label>
      <Select value={selectedIndustry} onValueChange={onIndustryChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select industry..." />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {industries.map((industry) => (
            <SelectItem key={industry.value} value={industry.value}>
              {industry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
