const express = require('express');
const Invoice = require('../models/Invoice');
const jwt = require('jsonwebtoken');
const router = express.Router();

// MIDDLEWARE - Verify Token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// CREATE INVOICE
router.post('/', verifyToken, async (req, res) => {
  try {
    const invoiceData = { ...req.body, userId: req.userId };
    const invoice = await Invoice.create(invoiceData);

    res.status(201).json({
      message: '✅ Invoice created successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Error creating invoice', error: error.message });
  }
});

// GET ALL INVOICES (User's invoices)
router.get('/', verifyToken, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching invoices', error: error.message });
  }
});

// GET SINGLE INVOICE
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found for this user' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: '❌ Error fetching invoice', error: error.message });
  }
});


// UPDATE INVOICE
// UPDATE INVOICE
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await invoice.update(req.body);

    res.json({
      message: '✅ Invoice updated successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Error updating invoice', error: error.message });
  }
});

// DELETE INVOICE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await invoice.destroy();
    res.json({ message: '✅ Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error deleting invoice', error: error.message });
  }
});

// UPDATE INVOICE STATUS
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await invoice.update({ status: req.body.status });

    res.json({
      message: '✅ Invoice status updated',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Error updating status', error: error.message });
  }
});


module.exports = router;