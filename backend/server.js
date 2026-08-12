require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const eligibilityRoutes = require('./routes/eligibilityRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Seed data
const seedData = require('./seed');

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true
  })
);

app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Backend Running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use('/api/check-eligibility', eligibilityRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  try {
    console.log('Firebase initialized.');

    // Seed fresh data if schemes are empty
    const Scheme = require('./models/Scheme');
    const existingSchemes = await Scheme.find({});
    if (existingSchemes.length === 0) {
      console.log('No schemes found. Seeding initial data...');
      await seedData();
      console.log('Seeding complete.');
    } else {
      console.log('Database already contains data. Skipping seeding.');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();