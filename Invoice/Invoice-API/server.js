const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();

// ✅ FIX: Allow all Vercel deployments (preview + production) + local dev
const allowedOrigins = [
  /\.vercel\.app$/,           // all *.vercel.app previews
  /^http:\/\/localhost/,       // local development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Lazy DB init — runs once per serverless container
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
      dbInitPromise = null;
      console.error('❌ DB init error:', err.message);
      throw err;
    }
  })();

  return dbInitPromise;
};

initializeDatabase().catch(() => {});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Invoice Backend Running' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}