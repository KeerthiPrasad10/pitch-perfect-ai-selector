
import type { CompanyDetails } from './types.ts';
import { availableIndustries } from './industry-config.ts';

// Get enhanced company details using AI
export async function getCompanyDetails(
  companyName: string, 
  isIFSCustomer: boolean = false,
  openAIApiKey?: string,
  ifsCustomerData?: any
): Promise<CompanyDetails> {
  if (!openAIApiKey) {
    return {
      formalName: companyName,
      description: `${companyName} is a company that could benefit from AI/ML solutions.`,
      revenue: null,
      employees: null,
      businessModel: null,
      keyProducts: null,
      ...(isIFSCustomer && ifsCustomerData && {
        ifsVersion: ifsCustomerData.ifs_version || "IFS Cloud",
        customerSince: "2020+",
        customerNumber: ifsCustomerData.customer_number || ifsCustomerData.customer_no,
        softwareReleaseVersion: ifsCustomerData.software_release_version || ifsCustomerData.ifs_software_release_version,
        releaseVersion: ifsCustomerData.release_version,
        baseIfsVersion: ifsCustomerData.base_ifs_version
      })
    };
  }

  try {
    const prompt = `Provide detailed information about the company "${companyName}". Focus on their actual business operations, not just their industry classification.

Please provide:
1. Formal company name
2. Detailed business description (what they actually do, their operations, revenue sources)
3. Estimated revenue range
4. Estimated number of employees
5. Business model
6. Key products or services

Format as JSON:
{
  "formalName": "Official Company Name",
  "description": "Detailed description of actual business operations",
  "revenue": "revenue range or null",
  "employees": "employee count range or null", 
  "businessModel": "how they make money",
  "keyProducts": "main products/services"
}`;

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
            content: 'You are a business research analyst. Provide factual information about companies based on their actual business operations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.log('Failed to get company details from AI');
      return getBasicCompanyDetails(companyName, isIFSCustomer, ifsCustomerData);
    }

    const data = await response.json();
    let companyInfo = data.choices[0].message.content;

    if (companyInfo.includes('```json')) {
      companyInfo = companyInfo.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const parsedInfo = JSON.parse(companyInfo);
    
    const result = {
      formalName: parsedInfo.formalName || companyName,
      description: parsedInfo.description || `${companyName} is a company that could benefit from AI/ML solutions.`,
      revenue: parsedInfo.revenue || null,
      employees: parsedInfo.employees || null,
      businessModel: parsedInfo.businessModel || null,
      keyProducts: parsedInfo.keyProducts || null,
      ...(isIFSCustomer && ifsCustomerData && {
        ifsVersion: ifsCustomerData.ifs_version || "IFS Cloud",
        customerSince: "2020+",
        customerNumber: ifsCustomerData.customer_number || ifsCustomerData.customer_no,
        softwareReleaseVersion: ifsCustomerData.software_release_version || ifsCustomerData.ifs_software_release_version,
        releaseVersion: ifsCustomerData.release_version,
        baseIfsVersion: ifsCustomerData.base_ifs_version
      })
    };

    console.log(`Enhanced company details for ${companyName}:`, result);
    return result;

  } catch (error) {
    console.log('Error getting enhanced company details:', error);
    return getBasicCompanyDetails(companyName, isIFSCustomer, ifsCustomerData);
  }
}

// NEW: Dedicated AI-driven industry classification function
export async function classifyCompanyIndustry(
  companyName: string,
  companyDescription: string,
  documentInsights: string[] = [],
  openAIApiKey?: string
): Promise<string> {
  if (!openAIApiKey) {
    console.log('No OpenAI API key available for industry classification');
    return 'other';
  }

  try {
    const documentContext = documentInsights && documentInsights.length > 0 
      ? `\n\nDocument insights about ${companyName}:\n${documentInsights.join('\n')}`
      : '';

    const prompt = `Analyze the company "${companyName}" and determine their PRIMARY industry classification based on their actual business operations and main revenue sources.

Company Information:
- Business Description: ${companyDescription}${documentContext}

Available Industries: ${availableIndustries.join(', ')}

IMPORTANT: Base your classification on:
1. The company's PRIMARY business operations and main revenue sources
2. What the company ACTUALLY does day-to-day
3. Their core business model and customer base
4. Document insights (if provided) about their actual activities

DO NOT classify based on:
- Just the company name
- Secondary business lines
- What AI/ML use cases they might need

For diversified companies, choose the industry that represents their largest revenue source or primary operations.

Respond with ONLY the industry name in lowercase (e.g., "manufacturing", "technology", "healthcare").`;

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
            content: 'You are an expert business analyst who classifies companies based on their actual business operations, not their potential use cases. Focus on what the company actually does to generate revenue.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.log('Failed to classify company industry with AI');
      return 'other';
    }

    const data = await response.json();
    const classifiedIndustry = data.choices[0].message.content.trim().toLowerCase();
    
    // Validate that the returned industry is in our available industries
    if (availableIndustries.includes(classifiedIndustry)) {
      console.log(`AI classified ${companyName} as ${classifiedIndustry} industry`);
      return classifiedIndustry;
    } else {
      console.log(`AI returned invalid industry: ${classifiedIndustry}, defaulting to 'other'`);
      return 'other';
    }

  } catch (error) {
    console.log('Error in AI industry classification:', error);
    return 'other';
  }
}

function getBasicCompanyDetails(companyName: string, isIFSCustomer: boolean, ifsCustomerData?: any): CompanyDetails {
  return {
    formalName: companyName,
    description: `${companyName} is a company that could benefit from AI/ML solutions.`,
    revenue: null,
    employees: null,
    businessModel: null,
    keyProducts: null,
    ...(isIFSCustomer && ifsCustomerData && {
      ifsVersion: ifsCustomerData.ifs_version || "IFS Cloud",
      customerSince: "2020+",
      customerNumber: ifsCustomerData.customer_number || ifsCustomerData.customer_no,
      softwareReleaseVersion: ifsCustomerData.software_release_version || ifsCustomerData.ifs_software_release_version,
      releaseVersion: ifsCustomerData.release_version,
      baseIfsVersion: ifsCustomerData.base_ifs_version
    })
  };
}
