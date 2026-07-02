const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Correct CORS setup – allow your frontend origin
const corsOptions = {
  origin: [
    'https://idea-board-aj19.onrender.com',   // your frontend URL
    'http://localhost:5173',                  // local development
    'http://localhost:3001'                   // local backend (if needed)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you use cookies/auth
};

app.use(cors(corsOptions));
app.use(express.json());

// ... rest of your code (assignCategory, routes, etc.)