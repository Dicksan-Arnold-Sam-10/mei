require('dotenv').config();
const app = require('../server');

// Export Express app for Vercel serverless
module.exports = app;
