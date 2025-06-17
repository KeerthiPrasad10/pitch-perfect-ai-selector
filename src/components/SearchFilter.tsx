
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "automation", label: "Process Automation" },
  { value: "analytics", label: "Data Analytics" },
  { value: "customer-service", label: "Customer Service" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "operations", label: "Operations" },
  { value: "security", label: "Security & Compliance" },
  { value: "hr", label: "Human Resources" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "quality", label: "Quality Control" },
  { value: "predictive", label: "Predictive Maintenance" }
];

export const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange 
}: SearchFilterProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Search Use Cases</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
