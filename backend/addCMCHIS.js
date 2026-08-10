const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');

dotenv.config();

const cmchisScheme = {
  schemeName: 'Tamil Nadu Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS)',
  provider: 'government',
  category: 'insurance',
  subCategory: 'Health Insurance',
  state: 'Tamil Nadu',
  interestRate: 0,
  description:
    'This scheme is designed to provide free and high-quality medical treatment to economically weaker families in Tamil Nadu. It aims to reduce the financial burden of hospitalization and major surgeries by offering cashless treatment through a network of empanelled hospitals. The scheme covers a wide range of medical procedures including critical illnesses, ensuring access to healthcare for all eligible citizens. It plays a key role in improving public health, improving life expectancy, and reducing out-of-pocket medical expenses for vulnerable families.',
  benefits: [
    'Free treatment up to ₹5,00,000 per family per year',
    'Cashless hospitalization in approved hospitals',
    'Covers over 1000+ medical procedures',
    'Includes surgeries, ICU care, diagnostics, and medicines',
    'Pre and post hospitalization expenses covered',
    'Wide network of government and private hospitals',
    'Reduces financial burden on low-income families',
    'Emergency and life-saving treatments covered'
  ],
  eligibility: {
    minAge: 0,
    maxAge: 120,
    minIncome: 0,
    maxIncome: 120000,
    jobType: ['unemployed', 'farmer', 'self-employed'],
    gender: 'All',
    community: ['General', 'OBC', 'SC', 'ST'],
    maritalStatus: 'All',
    differentlyAbled: false
  },
  documents: [
    'Aadhaar Card',
    'Ration Card',
    'Income Certificate',
    'Address Proof',
    'Passport size photo'
  ],
  applicationSteps: [
    { step: 1, description: 'Visit the nearest government hospital or District Collector office to apply.' },
    { step: 2, description: 'Submit your Ration Card, Aadhaar Card, and Income Certificate for verification.' },
    { step: 3, description: 'You can also apply online at https://www.cmchistn.com by registering with your family details.' },
    { step: 4, description: 'After verification, a CMCHIS Smart Health Card will be issued to the family.' },
    { step: 5, description: 'Use the Smart Health Card at any empanelled hospital for cashless treatment up to ₹5 Lakh per year.' }
  ],
  officialWebsite: 'https://www.cmchistn.com'
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if already exists to avoid duplicates
    const existing = await Scheme.findOne({ schemeName: cmchisScheme.schemeName });
    if (existing) {
      console.log('CMCHIS scheme already exists in the database. Updating...');
      await Scheme.findByIdAndUpdate(existing._id, cmchisScheme);
      console.log('CMCHIS scheme updated successfully!');
    } else {
      const created = await Scheme.create(cmchisScheme);
      console.log('CMCHIS scheme added successfully! ID:', created._id);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

run();
