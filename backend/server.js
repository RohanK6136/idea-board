const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Fix CORS - allow your frontend domain
app.use(cors({
  origin: [
    'https://idea-board-aj19.onrender.com',  // your frontend URL
    'https://idea-board.onrender.com',       // your backend URL (if needed)
    'http://localhost:5173',                 // local dev
    'http://localhost:3001'                  // local backend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ... rest of your code (assignCategory, routes, etc.)