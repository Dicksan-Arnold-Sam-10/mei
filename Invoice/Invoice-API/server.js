const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express();

// debug output for env vars
console.log('🔧 Environment variables:');
console.log('  DB_HOST=', process.env.DB_HOST);
console.log('  DB_PORT=', process.env.DB_PORT);
console.log('  DB_NAME=', process.env.DB_NAME);
console.log('  DB_USER=', process.env.DB_USER);
console.log('  JWT_SECRET=', !!process.env.JWT_SECRET ? '[redacted]' : undefined);


// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sync Database (only on first initialization)
let syncPromise = null;
const initializeDatabase = async () => {
  if (!syncPromise) {
    syncPromise = sequelize.sync({ alter: false })
      .then(() => console.log('✅ Database synced'))
      .catch(err => console.log('❌ Sync Error:', err));
  }
  return syncPromise;
};

sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL Connected');
    initializeDatabase();
  })
  .catch(err => console.log('❌ MySQL Error:', err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: '✅ Invoice Backend Running' });
});

// export the app for serverless environments
module.exports = app;

// start local server when invoked directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}