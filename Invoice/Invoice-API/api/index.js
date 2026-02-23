// Vercel automatically injects environment variables - no dotenv needed
const app = require('../server');

// Export Express app for Vercel serverless
module.exports = app;
