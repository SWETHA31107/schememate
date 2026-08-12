const mongoose = require('./models/db');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Scheme = require('./models/Scheme');
const Feedback = require('./models/Feedback');

dotenv.config();

const states = [
  'National', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
  'Lakshadweep', 'Puducherry'
];

const subCats = {
  loan: ['Home Loan', 'Education Loan', 'Personal Loan', 'Business Loan', 'Gold Loan'],
  savings: ['Fixed Deposit', 'Recurring Deposit', 'Savings Account', 'Sukanya Samriddhi Yojana', 'PPF'],
  insurance: ['Life Insurance', 'Health Insurance', 'Motor Insurance', 'Crop Insurance'],
  pension: ['Atal Pension Yojana', 'Old Age Pension', 'NPS'],
  student: ['Higher Education Scholarship', 'Study Abroad Loan', 'Skill Development'],
  housing: ['Urban Housing Support', 'Rural Home Renovation', 'Affordable Housing Scheme', 'PMAY Urban'],
  business: ['Startup Growth Fund', 'MSME Support', 'Women Entrepreneurship Initiative'],
  marriage: ['Community Marriage Support', 'Wedding Savings Scheme'],
  health: ['Comprehensive Health Cover', 'Maternity Benefit', 'Senior Citizen Healthcare'],
  child: ['Child Education Fund', 'Child Health Savings'],
  agriculture: ['Kisan Credit Card', 'Pradhan Mantri Fasal Bima Yojana', 'Soil Health Card', 'PM Kisan Samman Nidhi'],
  education: ['Merit Scholarship', 'Post-Matric Scholarship', 'Pre-Matric Scholarship'],
  employment: ['PMKVY Skill India', 'NRLM Livelihood Support', 'MGNREGA Employment Guarantee'],
  women_welfare: ['Beti Bachao Beti Padhao', 'Mahila Shakti Kendra', 'One Stop Centre', 'Ujjwala Yojana'],
  child_welfare: ['Integrated Child Development Service', 'POCSO Legal Aid', 'Bal Shakti Award'],
  senior_citizen: ['Indira Gandhi National Old Age Pension', 'Senior Citizen Savings Scheme', 'Ayushman Bharat Senior'],
  disability: ['ADIP Scheme', 'Disability Pension', 'Accessible India Campaign Grant']
};

const jobTypes = ['salaried', 'self-employed', 'business', 'student', 'retired', 'farmer', 'unemployed'];
const castes = ['General', 'OBC', 'BC', 'MBC', 'SC', 'ST'];
const maritalStatuses = ['All', 'Single', 'Married', 'Widowed', 'Divorced'];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

const generateBalanced500 = () => {
  const schemes = [];
  const categories = Object.keys(subCats);
  let idCounter = 1;

  // First Pass: 1 scheme per (category, state) until 500
  for (const cat of categories) {
    for (const state of states) {
      if (schemes.length >= 500) break;
      
      const subCategory = randomPick(subCats[cat]);
      const provider = state === 'National' ? randomPick(['government', 'corporate', 'private']) : 'government';
      const intRate = cat === 'loan' ? randomFloat(6.0, 14.0) : randomFloat(3.5, 8.5);
      const name = `${state} ${subCategory} - Master ID #${idCounter}`;
      
      schemes.push({
        schemeName: name,
        provider: provider,
        category: cat,
        subCategory: subCategory,
        state: state,
        interestRate: intRate,
        eligibility: {
          minAge: randomInt(1, 18),
          maxAge: randomInt(60, 99),
          minIncome: 0,
          maxIncome: randomInt(10, 50) * 100000,
          jobType: [randomPick(jobTypes), randomPick(jobTypes)],
          gender: 'All',
          community: [randomPick(castes)],
          maritalStatus: 'All'
        },
        benefits: [`Master benefit for ${subCategory}`, 'Quick Approval Process', 'Minimum Documentation'],
        description: `National-grade ${cat} support platform for ${state}. High value, low interest.`,
        documents: ['Aadhar Card', 'Income Certificate', 'Address Proof'],
        applicationSteps: [{ step: 1, description: 'Register on portal' }, { step: 2, description: 'File application' }]
      });
      idCounter++;
    }
  }

  // Second Pass (If needed, highly unlikely given 17*37=629): Fill up to 500
  while (schemes.length < 500) {
      const cat = randomPick(categories);
      const state = randomPick(states);
      const subCategory = randomPick(subCats[cat]);
      schemes.push({
          schemeName: `${state} Special ${subCategory} P${idCounter}`,
          provider: 'government', category: cat, subCategory, state,
          interestRate: randomFloat(1.0, 8.0),
          eligibility: { minAge: 1, maxAge: 120, gender: 'All', community: ['General'], maritalStatus: 'All' },
          benefits: [`Extra support for ${cat} in ${state}`],
          description: `Priority ${cat} welfare scheme.`,
          documents: ['Aadhar Card'],
          applicationSteps: [{ step: 1, description: 'Direct application' }]
      });
      idCounter++;
  }

  return schemes.slice(0, 500);
};

const seedData = async () => {
  try {
    console.log('Seeding Balanced 500 Ecosystem...');
    await User.deleteMany();
    await Scheme.deleteMany();

    // Create Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@schememate.com',
      mobile: '9876543210',
      password: 'Admin@123',
      role: 'admin'
    });

    // Create Sample User
    await User.create({
      name: 'Test User',
      email: 'user@example.com',
      mobile: '9123456789',
      password: 'password123',
      role: 'user'
    });

    const allSchemes = generateBalanced500();
    await Scheme.insertMany(allSchemes);

    // Initial Feedback
    const sampleFeedbacks = [
      { email: 'sarah.j@outlook.com', rating: 5, message: 'The scheme matching engine is incredibly accurate. Found a loan I didn\'t know existed!' },
      { email: 'm.kumar@gmail.com', rating: 4, message: 'Great platform, but would love to see more private sector insurance schemes added.' },
      { email: 'priya_v@yahoo.com', rating: 5, message: 'Seamless experience. The bilingual support in Tamil is a life-saver for my parents.' }
    ];
    await Feedback.insertMany(sampleFeedbacks);

    console.log(`Successfully seeded ${allSchemes.length} schemes and ${sampleFeedbacks.length} feedbacks.`);
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedData;
