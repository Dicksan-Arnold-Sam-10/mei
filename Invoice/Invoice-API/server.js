const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sync Database
sequelize.sync({ alter: false })
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.log('❌ Sync Error:', err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: '✅ Invoice Backend Running (MySQL)' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));