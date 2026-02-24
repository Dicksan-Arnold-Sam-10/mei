const express = require('express');
const cors = require('cors');
// ❌ REMOVED: dotenv - Vercel injects env vars automatically
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://mei-f3xnnazh2-dicksanarnoldsam1141-6056s-projects.vercel.app',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Lazy DB init — runs once per serverless container (handles cold starts safely)
let dbInitialized = false;
let dbInitPromise = null;

const initializeDatabase = async () => {
  if (dbInitialized) return;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ MySQL Connected');
      await sequelize.sync({ alter: false });
      console.log('✅ Database synced');
      dbInitialized = true;
    } catch (err) {
      dbInitPromise = null; // allow retry on next request
      console.error('❌ DB init error:', err.message);
      throw err;
    }
  })();

  return dbInitPromise;
};

// Run DB init on app load (non-blocking — errors handled per-request)
initializeDatabase().catch(() => {});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Invoice Backend Running' });
});

// Export for Vercel serverless
module.exports = app;

// Start local server only when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}