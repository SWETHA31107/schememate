const Scheme = require('../models/Scheme');
const seedData = require('../seed');

// @desc    Get all schemes with filters
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
  try {
    const { provider, category, state, search, gender, community, maritalStatus, age, interestRate } = req.query;
    let query = {};

    if (provider) query.provider = provider;
    if (category) query.category = category;
    if (state) query.state = state;

    if (gender && gender !== 'All') {
      query['eligibility.gender'] = { $in: [gender, 'All'] };
    }
    
    if (community) {
      query['eligibility.community'] = community; 
    }

    if (maritalStatus && maritalStatus !== 'All') {
      query['eligibility.maritalStatus'] = { $in: [maritalStatus, 'All'] };
    }

    if (age) {
      const parsedAge = Number(age);
      if (!isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 120) {
         query.$and = query.$and || [];
         query.$and.push({ $or: [{ 'eligibility.minAge': { $lte: parsedAge } }, { 'eligibility.minAge': { $exists: false } }, { 'eligibility.minAge': null }] });
         query.$and.push({ $or: [{ 'eligibility.maxAge': { $gte: parsedAge } }, { 'eligibility.maxAge': { $exists: false } }, { 'eligibility.maxAge': null }] });
      }
    }

    if (interestRate) {
      const parsedRate = Number(interestRate);
      if (!isNaN(parsedRate)) {
        query.interestRate = { $lte: parsedRate };
      }
    }
    
    if (search) {
      const searchConditions = [
        { schemeName: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else {
        query.$or = searchConditions;
      }
    }

    const schemes = await Scheme.find(query).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single scheme
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (scheme) {
      res.json(scheme);
    } else {
      res.status(404).json({ message: 'Scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new scheme
// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    const createdScheme = await scheme.save();
    res.status(201).json(createdScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a scheme
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (scheme) {
      Object.assign(scheme, req.body);
      const updatedScheme = await scheme.save();
      res.json(updatedScheme);
    } else {
      res.status(404).json({ message: 'Scheme not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a scheme
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (scheme) {
      await scheme.deleteOne();
      res.json({ message: 'Scheme removed' });
    } else {
      res.status(404).json({ message: 'Scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset all schemes to seed data
// @route   POST /api/schemes/reset
// @access  Private/Admin
const resetSchemes = async (req, res) => {
  try {
    await seedData();
    res.json({ message: 'Database reset and reseeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  resetSchemes
};
