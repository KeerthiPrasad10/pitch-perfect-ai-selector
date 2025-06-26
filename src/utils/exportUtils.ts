
export const exportToExcel = (
  customerName: string,
  selectedIndustry: string,
  aiRecommendations: any[],
  searchTerm: string,
  selectedCategory: string,
  customerAnalysis?: any
) => {
  // Convert AI recommendations to the format expected
  const aiUseCases = aiRecommendations.map((useCase, index) => ({
    id: `ai-${index}`,
    title: useCase.title,
    description: useCase.description,
    category: useCase.category,
    roi: useCase.roi?.replace('%', '') || 'TBD',
    implementation: useCase.implementation,
    timeline: useCase.timeline,
    industries: [selectedIndustry],
    costSavings: useCase.costSavings || "TBD",
    isAiRecommended: true,
    baseVersion: useCase.baseVersion || 'TBD',
    releaseVersion: useCase.releaseVersion || 'TBD',
    requiredProcess: useCase.requiredProcess || 'TBD'
  }));

  // Create CSV content
  const headers = [
    'Use Case Title',
    'Description',
    'Category',
    'ROI (%)',
    'Implementation Complexity',
    'Timeline',
    'Cost Savings',
    'Industries',
    'Base Version',
    'Release Version',
    'Required Process',
    'AI Recommended'
  ];

  const csvContent = [
    // Report header
    [`IFS AI Use Case Report`],
    [`Customer: ${customerName}`],
    [`Industry: ${selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}`],
    [`Customer Type: ${customerAnalysis?.customerType ? customerAnalysis.customerType.charAt(0).toUpperCase() + customerAnalysis.customerType.slice(1) : 'Unknown'}`],
    ...(customerAnalysis?.companyDetails?.customerNumber ? [[`Customer Number: ${customerAnalysis.companyDetails.customerNumber}`]] : []),
    ...(customerAnalysis?.companyDetails?.ifsVersion ? [[`IFS Version: ${customerAnalysis.companyDetails.ifsVersion}`]] : []),
    ...(customerAnalysis?.companyDetails?.softwareReleaseVersion ? [[`Software Release: ${customerAnalysis.companyDetails.softwareReleaseVersion}`]] : []),
    [`Generated: ${new Date().toLocaleDateString()}`],
    [`Total Recommendations: ${aiUseCases.length}`],
    [],
    // Data headers
    headers,
    // Data rows
    ...aiUseCases.map(useCase => [
      useCase.title,
      useCase.description,
      useCase.category.replace('-', ' '),
      useCase.roi,
      useCase.implementation,
      useCase.timeline,
      useCase.costSavings || 'TBD',
      useCase.industries.join(', '),
      useCase.baseVersion,
      useCase.releaseVersion,
      useCase.requiredProcess,
      useCase.isAiRecommended ? 'Yes' : 'No'
    ])
  ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `IFS_AI_Report_${customerName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
