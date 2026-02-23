// explicit require so that the mysql2 package is included in Vercel bundles
require('mysql2');
const { Sequelize } = require('sequelize');
// ❌ REMOVED: require('dotenv').config() - Vercel injects env vars automatically

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 2,        // keep pool small for serverless
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// ❌ REMOVED: sequelize.authenticate() here — was causing double connection
// Authentication is handled once in server.js

module.exports = sequelize;