const mongoose = require('./db');

const schemeSchema = new mongoose.Schema({
  schemeName: { type: String, required: true },
  provider: { type: String, required: true, enum: ['government', 'private', 'corporate'] },
  category: { type: String, required: true }, // Main Category: loan, insurance, pension, savings
  subCategory: { type: String }, // Sub Category: Home Loan, Life Insurance, etc.
  state: { type: String, default: 'National' }, // National or State Name
  interestRate: { type: Number, required: true },
  eligibility: {
    minAge: { type: Number },
    maxAge: { type: Number },
    minIncome: { type: Number },
    maxIncome: { type: Number },
    jobType: [{ type: String }],
    gender: { type: String, enum: ['All', 'Male', 'Female', 'Other'], default: 'All' },
    community: [{ type: String }], // e.g., General, BC, MBC, SC, ST
    maritalStatus: { type: String, enum: ['All', 'Single', 'Married', 'Widowed', 'Divorced'], default: 'All' },
    differentlyAbled: { type: Boolean, default: false }
  },
  benefits: [{ type: String }], // Array of benefits for better listing
  description: { type: String, required: true },
  documents: [{ type: String }],
  applicationSteps: [{
    step: { type: Number },
    description: { type: String }
  }],
  officialWebsite: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
