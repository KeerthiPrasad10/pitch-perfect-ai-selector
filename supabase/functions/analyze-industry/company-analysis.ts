
import type { CompanyDetails } from './types.ts';

// Enhanced company analysis with OpenAI
export async function getCompanyDetails(
  companyName: string, 
  isIFSCustomer: boolean = false,
  openAIApiKey?: string
): Promise<CompanyDetails> {
  if (!openAIApiKey) {
    return {
      formalName: companyName,
      description: `Analysis for ${companyName}`,
      revenue: null,
      employees: null,
      businessModel: null,
      keyProducts: null
    };
  }

  try {
    const prompt = `Provide detailed information about the company "${companyName}". Return a JSON object with:
    {
      "formalName": "Official legal company name",
      "description": "Brief description of their business, what they do, main products/services",
      "revenue": "Annual revenue if known (e.g., '$5B', '$500M')",
      "employees": "Number of employees if known (e.g., '10,000+', '500-1000')",
      "businessModel": "Brief description of their business model and key differentiators",
      "keyProducts": "Main products or services they offer"
    }
    
    Be factual and concise. If information is not available, use null for that field.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a business intelligence expert. Provide factual company information in the requested JSON format only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get company details');
    }

    const data = await response.json();
    let companyInfo = data.choices[0].message.content;

    // Clean up response if it has markdown formatting
    if (companyInfo.includes('```json')) {
      companyInfo = companyInfo.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const details = JSON.parse(companyInfo);
    
    // Add IFS-specific details if it's a customer
    if (isIFSCustomer) {
      details.ifsVersion = "IFS Cloud"; // Default, could be enhanced with actual data
      details.customerSince = "2020+"; // Default, could be enhanced with actual data
    }
    
    return details;
  } catch (error) {
    console.log('Error getting company details:', error);
    return {
      formalName: companyName,
      description: `${companyName} is a company in the specified industry`,
      revenue: null,
      employees: null,
      businessModel: null,
      keyProducts: null
    };
  }
}
