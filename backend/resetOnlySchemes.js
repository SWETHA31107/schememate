const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('./models/Scheme');

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

const categories = [
  'loan', 'savings', 'insurance', 'pension', 'student', 'housing', 'business', 
  'marriage', 'health', 'child', 'agriculture', 'education', 'employment', 
  'women_welfare', 'child_welfare', 'senior_citizen', 'disability'
];

const subCats = {
  loan: ['Home Loan', 'Education Loan', 'Personal Loan', 'Business Loan', 'Agricultural Loan', 'Gold Loan'],
  savings: ['Fixed Deposit', 'Recurring Deposit', 'Savings Account', 'Sukanya Samriddhi Yojana', 'PPF'],
  insurance: ['Life Insurance', 'Health Insurance', 'Motor Insurance', 'Crop Insurance', 'Term Insurance'],
  pension: ['Atal Pension Yojana', 'EPS', 'Old Age Pension', 'NPS'],
  student: ['Higher Education Scholarship', 'Study Abroad Loan', 'Skill Development', 'Tuition Waiver'],
  housing: ['Urban Housing Support', 'Rural Home Renovation', 'Affordable Housing Scheme', 'PMAY Urban', 'PMAY Rural', 'Rental Housing Assistance'],
  business: ['Startup Growth Fund', 'MSME Support', 'Women Entrepreneurship Initiative'],
  marriage: ['Community Marriage Support', 'Financial Aid for Marriage', 'Wedding Savings Scheme'],
  health: ['Comprehensive Health Cover', 'Maternity Benefit', 'Senior Citizen Healthcare'],
  child: ['Child Education Fund', 'Child Health Savings', 'Future Security Scheme'],
  agriculture: ['Kisan Credit Card', 'Pradhan Mantri Fasal Bima Yojana', 'Soil Health Card', 'PM Kisan Samman Nidhi', 'Micro Irrigation Fund', 'Agricultural Infrastructure Fund', 'Kisan Vikas Patra', 'Crop Loan Waiver Scheme'],
  education: ['Merit Scholarship', 'Post-Matric Scholarship', 'Pre-Matric Scholarship', 'National Fellowship', 'Digital Literacy Program', 'Vocational Training Grant', 'Evening Study Classes Subsidy'],
  employment: ['PMKVY Skill India', 'NRLM Livelihood Support', 'MGNREGA Employment Guarantee', 'Startup India Seed Fund', 'Self-Help Group Micro Loan', 'Employment Exchange Registration Incentive'],
  women_welfare: ['Beti Bachao Beti Padhao', 'Mahila Shakti Kendra', 'One Stop Centre', 'Ujjwala Yojana', 'Women Self Help Group Loan', 'Skill Training for Women', 'Women Safety Fund'],
  child_welfare: ['Integrated Child Development Service', 'POCSO Legal Aid', 'Bal Shakti Award', 'Mid-Day Meal Scheme', 'National Child Labour Re-integration', 'Kishori Shakti Yojana'],
  senior_citizen: ['Indira Gandhi National Old Age Pension', 'Varistha Pension Bima Yojana', 'Senior Citizen Savings Scheme', 'Ayushman Bharat Senior', 'National Programme for Elderly', 'Annapurna Food Scheme'],
  disability: ['ADIP Scheme', 'National Handicapped Finance Dev Corp Loan', 'Disability Pension', 'Accessible India Campaign Grant', 'Divyangjan Scholarship', 'Assistive Technology Subsidy', 'Barrier-Free Infrastructure Grant']
};

const jobTypes = ['salaried', 'self-employed', 'student', 'retired', 'farmer', 'unemployed'];
const castes = ['General', 'OBC', 'BC', 'MBC', 'SC', 'ST'];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

const generateBalancedSchemes = () => {
    const schemes = [];
    
    // Strategy: 
    // 1. Give each category exactly 15 schemes (17 * 15 = 255)
    // 2. Give each state at least 10 schemes.
    // 3. Round up to exactly 500.

    let idCounter = 1;

    // Phase 1: Categories
    for (const cat of categories) {
        for (let i = 0; i < 15; i++) {
            const state = states[(idCounter - 1) % states.length];
            const subCategory = randomPick(subCats[cat]);
            schemes.push({
                schemeName: `${state} ${subCategory} - Build ${idCounter}`,
                provider: 'government',
                category: cat,
                subCategory: subCategory,
                state: state,
                interestRate: randomFloat(2.0, 10.0),
                eligibility: { minAge: 18, maxAge: 99, gender: 'All', community: ['General', 'OBC', 'SC', 'ST'], maritalStatus: 'All' },
                benefits: [`High benefit ${subCategory}`, 'Quick processing'],
                description: `A master-grade ${cat} initiative dedicated to the people of ${state}.`,
                documents: ['Aadhar Card', 'Address Proof'],
                applicationSteps: [{ step: 1, description: 'Apply via official portal' }]
            });
            idCounter++;
        }
    }

    // Phase 2: States and remaining buffer (500 - 255 = 245)
    while (schemes.length < 500) {
        const state = states[idCounter % states.length];
        const cat = categories[idCounter % categories.length];
        const subCategory = randomPick(subCats[cat]);
        schemes.push({
            schemeName: `${state} ${subCategory} Support ${idCounter}`,
            provider: 'government',
            category: cat,
            subCategory: subCategory,
            state: state,
            interestRate: randomFloat(1.0, 9.0),
            eligibility: { minAge: 18, maxAge: 100, gender: 'All', community: ['General'], maritalStatus: 'All' },
            benefits: [`State-sponsored ${subCategory} aid`],
            description: `Priority ${cat} program for eligible residents of ${state}.`,
            documents: ['Aadhar Card'],
            applicationSteps: [{ step: 1, description: 'Direct application' }]
        });
        idCounter++;
    }

    return schemes.slice(0, 500);
};

const runReset = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/financial_schemes";
    await mongoose.connect(uri);
    console.log('Resetting DB...');
    
    await Scheme.deleteMany({});
    const newSchemes = generateBalancedSchemes();
    await Scheme.insertMany(newSchemes);
    
    console.log(`Successfully injected ${newSchemes.length} schemes.`);
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
};

runReset();
