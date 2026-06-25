// backend/controllers/quotationItemController.js
const QuotationItem = require('../models/quotationItemModel');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/quotation-items  -> list active quotation items
exports.getQuotationItems = asyncHandler(async (req, res) => {
  const list = await QuotationItem.find({ isDeleted: false })
    .populate('quotation')
    .populate('material');
  res.json(list);
});

// GET /api/quotation-items/deleted  -> recycle bin quotation items
exports.getDeletedQuotationItems = asyncHandler(async (req, res) => {
  const list = await QuotationItem.find({ isDeleted: true })
    .populate('quotation')
    .populate('material');
  res.json(list);
});

// GET /api/quotation-items/:id  -> single quotation item
exports.getQuotationItemById = asyncHandler(async (req, res) => {
  const doc = await QuotationItem.findById(req.params.id)
    .populate('quotation')
    .populate('material');
  if (!doc) {
    res.status(404);
    throw new Error('Quotation item not found');
  }
  res.json(doc);
});

// POST /api/quotation-items  -> create quotation item
exports.createQuotationItem = asyncHandler(async (req, res) => {
  const doc = await QuotationItem.create(req.body);
  res.status(201).json(doc);
});

// PUT /api/quotation-items/:id  -> update quotation item
exports.updateQuotationItem = asyncHandler(async (req, res) => {
  const doc = await QuotationItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!doc) {
    res.status(404);
    throw new Error('Quotation item not found');
  }
  res.json(doc);
});

// DELETE /api/quotation-items/:id  -> soft delete
exports.softDeleteQuotationItem = asyncHandler(async (req, res) => {
  const doc = await QuotationItem.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Quotation item not found');
  }
  res.json({ message: 'Quotation item moved to recycle bin' });
});

// PUT /api/quotation-items/:id/restore  -> restore
exports.restoreQuotationItem = asyncHandler(async (req, res) => {
  const doc = await QuotationItem.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false },
    { new: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Quotation item not found');
  }
  res.json(doc);
});
