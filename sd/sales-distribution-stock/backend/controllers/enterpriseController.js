// backend/controllers/enterpriseController.js
const Enterprise = require('../models/enterpriseModel');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/enterprise  -> list active enterprise records
exports.getEnterprises = asyncHandler(async (req, res) => {
  const list = await Enterprise.find({ isDeleted: false });
  res.json(list);
});

// GET /api/enterprise/deleted  -> recycle bin
exports.getDeletedEnterprises = asyncHandler(async (req, res) => {
  const list = await Enterprise.find({ isDeleted: true });
  res.json(list);
});

// GET /api/enterprise/:id  -> single enterprise record
exports.getEnterpriseById = asyncHandler(async (req, res) => {
  const doc = await Enterprise.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Enterprise record not found');
  }
  res.json(doc);
});

// POST /api/enterprise  -> create enterprise record
exports.createEnterprise = asyncHandler(async (req, res) => {
  const doc = await Enterprise.create(req.body);
  res.status(201).json(doc);
});

// PUT /api/enterprise/:id  -> update enterprise record
exports.updateEnterprise = asyncHandler(async (req, res) => {
  const doc = await Enterprise.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!doc) {
    res.status(404);
    throw new Error('Enterprise record not found');
  }
  res.json(doc);
});

// DELETE /api/enterprise/:id  -> soft delete
exports.softDeleteEnterprise = asyncHandler(async (req, res) => {
  const doc = await Enterprise.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Enterprise record not found');
  }
  res.json({ message: 'Enterprise record moved to recycle bin' });
});

// PUT /api/enterprise/:id/restore  -> restore
exports.restoreEnterprise = asyncHandler(async (req, res) => {
  const doc = await Enterprise.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false },
    { new: true }
  );
  if (!doc) {
    res.status(404);
    throw new Error('Enterprise record not found');
  }
  res.json(doc);
});
