const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');

dotenv.config();

const states = ['National', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat', 'Kerala', 'Uttar Pradesh'];

const generateSchemes = (count, overrides = {}) => {
  const schemes = [];
  for (let i = 0; i < count; i++) {
    schemes.push({
      schemeName: `${overrides.baseName || 'Targeted Program'} - V${Math.floor(Math.random() * 100000)}`,
      provider: ['government', 'private', 'corporate'][Math.floor(Math.random() * 3)],
      category: overrides.category || ['loan', 'savings', 'insurance', 'housing', 'agriculture'][Math.floor(Math.random() * 5)],
      subCategory: 'Target Policy',
      state: states[Math.floor(Math.random() * states.length)],
      interestRate: Number((Math.random() * 8 + 2).toFixed(2)),
      eligibility: {
        minAge: overrides.minAge !== undefined ? overrides.minAge : Math.floor(Math.random() * 40) + 1,
        maxAge: overrides.maxAge !== undefined ? overrides.maxAge : Math.floor(Math.random() * 40) + 60,
        gender: overrides.gender || ['All', 'Male', 'Female', 'Other'][Math.floor(Math.random() * 4)],
        community: overrides.community || [['General'], ['OBC'], ['SC'], ['ST'], ['BC', 'MBC']][Math.floor(Math.random() * 5)],
        maritalStatus: overrides.maritalStatus || ['All', 'Single', 'Married', 'Widowed', 'Divorced'][Math.floor(Math.random() * 5)],
        differentlyAbled: Math.random() > 0.8
      },
      benefits: ['Expansion grant', 'Direct coverage', 'Rebate provision'],
      description: `This is a highly targeted program providing dynamic assistance precisely mapped against the specified filter bounds requested. Focus: ${overrides.baseName || 'General Population'}.`,
      documents: ['Aadhar Card', 'Address Proof'],
      applicationSteps: [
        { step: 1, description: 'Complete online assessment.' },
        { step: 2, description: 'Approval by local authority.' }
      ],
      officialWebsite: 'https://india.gov.in'
    });
  }
  return schemes;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected for Intelligent Filter Injection...');

    let masterList = [];
    
    // 200 Explicit Agriculture
    masterList.push(...generateSchemes(200, { category: 'agriculture', baseName: 'AgriTech Kisaan Subsidy' }));
    
    // 200 Explicit OBC Community
    masterList.push(...generateSchemes(200, { community: ['OBC'], baseName: 'OBC Empowerment Fund' }));
    
    // 200 Explicit Gender (Other/Transgender explicitly locked)
    masterList.push(...generateSchemes(200, { gender: 'Other', baseName: 'Transgender Inclusive Growth' }));

    // 200 Explicit Marital Status Breakdowns
    masterList.push(...generateSchemes(50, { maritalStatus: 'Single', baseName: 'Youth Start Fund' }));
    masterList.push(...generateSchemes(50, { maritalStatus: 'Married', baseName: 'Joint Household Support' }));
    masterList.push(...generateSchemes(50, { maritalStatus: 'Widowed', baseName: 'Surviving Guardian Aid' }));
    masterList.push(...generateSchemes(50, { maritalStatus: 'Divorced', baseName: 'Rehabilitation FastTrack' }));

    // 200 Specific Age Locks
    masterList.push(...generateSchemes(100, { minAge: 1, maxAge: 18, baseName: 'Child Literacy Bond' }));
    masterList.push(...generateSchemes(100, { minAge: 65, maxAge: 120, baseName: 'Senior Citizen Relief' }));

    await Scheme.insertMany(masterList);
    
    console.log(`Successfully injected ${masterList.length} advanced targeted schemes without erasing existing models!`);
    process.exit(0);
  } catch (error) {
    console.error('Error injecting targeted seeds:', error);
    process.exit(1);
  }
};

seedDB();
