const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { errorHandler, notFoundHandler } = require('./middleware/error');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// In production, restrict CORS to the deployed frontend URL.
// Set FRONTEND_URL env var on Render (e.g. https://your-app.vercel.app).
// In development (no FRONTEND_URL set), all origins are allowed.
const corsOptions = process.env.FRONTEND_URL
  ? {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }
  : { origin: '*' };

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./routes/auth')(prisma));
app.use('/api/users', require('./routes/users')(prisma));
app.use('/api/records', require('./routes/records')(prisma));
app.use('/api/dashboard', require('./routes/dashboard')(prisma));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  if (process.env.FRONTEND_URL) {
    console.log(`   CORS origin : ${process.env.FRONTEND_URL}`);
  }
});

module.exports = { prisma };

