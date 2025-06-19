
export const getRoiColor = (roi: string) => {
  const roiValue = parseInt(roi) || 0;
  if (roiValue >= 200) return "bg-green-100 text-green-800";
  if (roiValue >= 100) return "bg-yellow-100 text-yellow-800";
  return "bg-blue-100 text-blue-800";
};

export const getImplementationColor = (complexity: string) => {
  switch (complexity) {
    case "Low": return "bg-green-100 text-green-800";
    case "Medium": return "bg-yellow-100 text-yellow-800";
    case "High": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const getRelevanceBadgeColor = (relevance: string) => {
  switch (relevance) {
    case 'primary': return 'bg-purple-100 text-purple-800';
    case 'secondary': return 'bg-blue-100 text-blue-800';
    case 'tertiary': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const isExistingUseCase = (useCaseTitle: string, currentUseCases: string[]) => {
  return currentUseCases.some((existing: string) => 
    existing.toLowerCase().includes(useCaseTitle.toLowerCase()) ||
    useCaseTitle.toLowerCase().includes(existing.toLowerCase())
  );
};
