const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const airtableRoutes = require('./routes/airtable');
const uploadRoutes = require('./routes/upload');

const app = express();

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/airtable-form-builder';
mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.log('MongoDB connection error:', err);
  console.log('Make sure MongoDB is running on your system');
  console.log('Using connection string:', mongoUri);
});

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://your-app-name.vercel.app', // Replace with your actual Vercel URL
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/airtable', airtableRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Airtable Form Builder API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
