const mockSchemes = [
  {
    _id: '1',
    schemeName: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    provider: 'government',
    category: 'insurance',
    interestRate: 0,
    eligibility: { minAge: 18, maxAge: 50 },
    benefits: 'Life insurance cover of ₹2 Lakhs at just ₹436 per annum.',
    description: 'PMJJBY gives life insurance cover of ₹2 Lakhs in case of death for any reason. Designed for all citizens with a bank account to encourage financial security.'
  },
  {
    _id: '2',
    schemeName: 'Atal Pension Yojana (APY)',
    provider: 'government',
    category: 'pension',
    interestRate: 8,
    eligibility: { minAge: 18, maxAge: 40 },
    benefits: 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month depending on contribution.',
    description: 'Aimed at the unorganized sector to provide a steady income after retirement at age 60.'
  },
  {
    _id: '3',
    schemeName: 'SBI Home Loan Saver',
    provider: 'private',
    category: 'loan',
    interestRate: 8.5,
    eligibility: { minAge: 21, minIncome: 300000, jobType: ['salaried', 'self-employed'] },
    benefits: 'Low interest rates, overdraft facility, flexible tenure up to 30 years.',
    description: 'A special home loan product by SBI designed to reduce your interest burden.'
  }
];

const mockUser = {
  _id: 'u1',
  name: 'Preview User',
  email: 'preview@example.com',
  age: 28,
  income: 450000,
  jobType: 'salaried',
  financialGoals: ['savings', 'insurance'],
  role: 'user',
  token: 'mock-token'
};

const mockRecommendations = mockSchemes.map((s, i) => ({
  scheme: s,
  score: 95 - i * 10,
  reason: 'Matches your financial goals and age criteria.'
}));

export const mockApi = {
  get: async (url) => {
    if (url.includes('/schemes')) return { data: mockSchemes };
    if (url.includes('/notifications')) return { data: [] };
    return { data: {} };
  },
  post: async (url, data) => {
    if (url.includes('/auth/login')) return { data: mockUser };
    if (url.includes('/recommend')) return { data: mockRecommendations };
    if (url.includes('/check-eligibility')) {
        return { data: { eligible: true, missingConditions: [], alternatives: [] } };
    }
    if (url.includes('/compare')) {
        return { data: mockSchemes.slice(0, 2) };
    }
    return { data: {} };
  }
};
