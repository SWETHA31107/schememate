const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');

dotenv.config();

const categories = [
  { id: 'loan', name: 'Loan', subCats: ['Home Loan', 'Car Loan', 'Personal Loan', 'Business Loan', 'Gold Loan'] },
  { id: 'insurance', name: 'Insurance', subCats: ['Life Insurance', 'Health Insurance', 'Crop Insurance', 'Term Insurance'] },
  { id: 'pension', name: 'Pension', subCats: ['Atal Pension Yojana', 'National Pension System', 'Old Age Pension'] },
  { id: 'savings', name: 'Savings', subCats: ['Fixed Deposit', 'Recurring Deposit', 'Sukanya Samriddhi Yojana'] },
  { id: 'student', name: 'Student / Education', subCats: ['Higher Education Scholarship', 'Study Abroad Loan', 'Skill Development'] },
  { id: 'housing', name: 'Housing / Home', subCats: ['Urban Housing Support', 'Rural Home Renovation', 'Affordable Housing'] },
  { id: 'business', name: 'Business Investment', subCats: ['Startup Growth Fund', 'MSME Support', 'Women Entrepreneurship'] },
  { id: 'marriage', name: 'Marriage', subCats: ['Community Marriage Support', 'Financial Aid for Marriage', 'Savings for Weddings'] },
  { id: 'health', name: 'Health / Medical', subCats: ['Comprehensive Health Cover', 'Maternity Benefit', 'Senior Citizen Healthcare'] },
  { id: 'child', name: 'Child Future Planning', subCats: ['Child Education Fund', 'Child Health Savings', 'Future Security Scheme'] }
];

const states = ['National', 'Tamil Nadu', 'Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'West Bengal', 'Uttar Pradesh'];
const genders = ['Male', 'Female', 'All'];
const communities = ['General', 'OBC', 'SC', 'ST'];
const providers = ['government', 'private', 'corporate'];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedExtraSchemes = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/financial_schemes';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for extra seeding...');

    const schemes = [];

    for (const cat of categories) {
      console.log(`Generating 20 schemes for category: ${cat.name}...`);
      for (let i = 1; i <= 20; i++) {
        const subCat = randomPick(cat.subCats);
        const state = randomPick(states);
        const gender = randomPick(genders);
        const community = [randomPick(communities)];
        const provider = randomPick(providers);
        
        const schemeName = `${state === 'National' ? 'PM' : state} ${subCat} ${cat.id.toUpperCase()}-${randomInt(100, 999)}`;
        
        schemes.push({
          schemeName,
          provider,
          category: cat.id,
          subCategory: subCat,
          state,
          interestRate: randomInt(0, 15),
          description: `This is a premium ${cat.name} scheme designed to provide financial support for ${subCat} to eligible candidates across ${state}. It focuses on ensuring accessible financial opportunities for the ${gender} demographic from ${community.join(', ')} communities.`,
          eligibility: {
            minAge: randomInt(0, 25),
            maxAge: randomInt(50, 100),
            minIncome: randomInt(0, 200000),
            maxIncome: randomInt(300000, 2000000),
            jobType: ['salaried', 'self_employed', 'student', 'farmer', 'unemployed'],
            gender,
            community,
            maritalStatus: 'All',
            differentlyAbled: Math.random() > 0.8
          },
          benefits: [
            `Financial assistance up to ₹${randomInt(1, 50)} Lakhs.`,
            'Flexible repayment options with low interest rates.',
            'Quick processing and minimal documentation required.',
            'Special benefits for verified applicants.'
          ],
          documents: ['Aadhar Card', 'Income Certificate', 'Address Proof', 'Photo'],
          applicationSteps: [
            { step: 1, description: 'Register on the official portal.' },
            { step: 2, description: 'Fill out the eligibility details.' },
            { step: 3, description: 'Upload required documents.' },
            { step: 4, description: 'Submit for verification.' }
          ],
          officialWebsite: 'https://schememate.gov.in'
        });
      }
    }

    console.log(`Ready to insert ${schemes.length} new schemes...`);
    await Scheme.insertMany(schemes);
    console.log('Successfully seeded 200 diversity-focused schemes!');
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedExtraSchemes();
