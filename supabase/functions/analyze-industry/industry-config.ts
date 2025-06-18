
// Base industry use cases
export const industryUseCases = {
  manufacturing: ['Predictive Maintenance', 'Quality Control Automation', 'Supply Chain Optimization', 'Energy Consumption Optimization'],
  energy: ['Energy Demand Forecasting', 'Predictive Maintenance', 'Asset Performance Optimization', 'Grid Stability Management'],
  aerospace: ['Predictive Maintenance', 'Quality Control Automation', 'Supply Chain Risk Management', 'Flight Operations Optimization'],
  construction: ['Project Timeline Optimization', 'Supply Chain Management', 'Safety Risk Assessment', 'Equipment Maintenance'],
  service: ['Customer Service Chatbots', 'Document Processing Automation', 'Price Optimization', 'Customer Behavior Analytics'],
  telco: ['Network Optimization', 'Customer Service Chatbots', 'Fraud Detection System', 'Predictive Network Maintenance'],
  healthcare: ['Medical Image Analysis', 'Drug Discovery Acceleration', 'Patient Risk Assessment', 'Treatment Optimization'],
  finance: ['Fraud Detection System', 'Credit Risk Assessment', 'Algorithmic Trading', 'Customer Service Chatbots'],
  retail: ['Demand Forecasting', 'Price Optimization', 'Customer Behavior Analytics', 'Inventory Management'],
  automotive: ['Predictive Maintenance', 'Quality Control Automation', 'Autonomous Vehicle Systems', 'Supply Chain Optimization'],
  utilities: ['Smart Grid Management', 'Energy Consumption Optimization', 'Predictive Maintenance', 'Customer Service Automation'],
  technology: ['Automated Code Generation', 'System Performance Optimization', 'Customer Service Chatbots', 'Cybersecurity Threat Detection'],
  logistics: ['Route Optimization', 'Demand Forecasting', 'Warehouse Automation', 'Supply Chain Optimization'],
  education: ['Personalized Learning Systems', 'Student Performance Analytics', 'Administrative Automation', 'Content Recommendation'],
  other: ['Document Processing Automation', 'Customer Service Chatbots', 'Data Analytics', 'Process Optimization']
};

// Fallback static relationships
export const staticRelationships = {
  manufacturing: {
    related: ['energy', 'automotive'],
    useCases: industryUseCases.manufacturing
  },
  energy: {
    related: ['utilities', 'manufacturing'],
    useCases: industryUseCases.energy
  },
  aerospace: {
    related: ['manufacturing', 'technology'],
    useCases: industryUseCases.aerospace
  },
  construction: {
    related: ['manufacturing', 'logistics'],
    useCases: industryUseCases.construction
  },
  service: {
    related: ['retail', 'technology'],
    useCases: industryUseCases.service
  },
  telco: {
    related: ['technology', 'service'],
    useCases: industryUseCases.telco
  },
  healthcare: {
    related: ['technology', 'service'],
    useCases: industryUseCases.healthcare
  },
  finance: {
    related: ['service', 'technology'],
    useCases: industryUseCases.finance
  },
  retail: {
    related: ['service', 'logistics'],
    useCases: industryUseCases.retail
  },
  automotive: {
    related: ['manufacturing', 'energy'],
    useCases: industryUseCases.automotive
  },
  utilities: {
    related: ['energy', 'service'],
    useCases: industryUseCases.utilities
  },
  technology: {
    related: ['service', 'telco'],
    useCases: industryUseCases.technology
  },
  logistics: {
    related: ['retail', 'manufacturing'],
    useCases: industryUseCases.logistics
  },
  education: {
    related: ['service', 'technology'],
    useCases: industryUseCases.education
  },
  other: {
    related: ['service', 'technology'],
    useCases: industryUseCases.other
  }
};
