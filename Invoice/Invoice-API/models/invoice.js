const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  invoiceNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dateOfIssue: {
    type: DataTypes.DATE
  },
  billTo: {
    type: DataTypes.STRING
  },
  billToEmail: {
    type: DataTypes.STRING
  },
  billToAddress: {
    type: DataTypes.TEXT
  },
  billFrom: {
    type: DataTypes.STRING
  },
  billFromEmail: {
    type: DataTypes.STRING
  },
  billFromAddress: {
    type: DataTypes.TEXT
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  subTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  discountRate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  sgstRate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  cgstRate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid'),
    defaultValue: 'draft'
  }
}, {
  timestamps: true
});

Invoice.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Invoice, { foreignKey: 'userId' });

module.exports = Invoice;