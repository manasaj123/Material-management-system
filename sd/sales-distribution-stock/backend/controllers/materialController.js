// backend/controllers/materialController.js
const asyncHandler = require("../middleware/asyncHandler");
const db = require("../models");

// GET /api/materials
exports.getMaterials = asyncHandler(async (req, res) => {
  const list = await db.Material.findAll({ where: { isDeleted: false } });
  res.json(list);
});

// GET /api/materials/deleted
exports.getDeletedMaterials = asyncHandler(async (req, res) => {
  const list = await db.Material.findAll({ where: { isDeleted: true } });
  res.json(list);
});

// GET /api/materials/:id
exports.getMaterialById = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: "Material not found" });
    return;
  }
  res.json(material);
});

// POST /api/materials

exports.createMaterial = asyncHandler(async (req, res) => {
  let {
    materialCode,
    description,
    baseUom,
    materialType,
    industrySector,
    documentDate,
    plant,
    storageLocation,
    movementType,
  } = req.body;

  // trim values
  materialCode = materialCode?.trim();
  description = description?.trim();
  baseUom = baseUom?.trim();
  materialType = materialType?.trim();
  industrySector = industrySector?.trim();
  plant = plant?.trim();
  storageLocation = storageLocation?.trim();
  movementType = movementType?.trim();

  // required validations
  if (!materialCode) {
    return res.status(400).json({
      message: "Material code is required",
    });
  }

  if (!description) {
    return res.status(400).json({
      message: "Description is required",
    });
  }

  if (!baseUom) {
    return res.status(400).json({
      message: "Base UOM is required",
    });
  }

  if (!materialType) {
    return res.status(400).json({
      message: "Material type is required",
    });
  }

  if (!industrySector) {
    return res.status(400).json({
      message: "Industry sector is required",
    });
  }

  if (!plant) {
    return res.status(400).json({
      message: "Plant is required",
    });
  }

  if (!storageLocation) {
    return res.status(400).json({
      message: "Storage location is required",
    });
  }

  if (!movementType) {
    return res.status(400).json({
      message: "Movement type is required",
    });
  }

  // material code cannot be only 0
  if (materialCode === "0") {
    return res.status(400).json({
      message: "Material code cannot be 0",
    });
  }

  // no special characters
  if (!/^[A-Za-z0-9]+$/.test(materialCode)) {
    return res.status(400).json({
      message: "Invalid material code",
    });
  }

  // plant validation
  if (!/^[A-Za-z0-9]+$/.test(plant)) {
    return res.status(400).json({
      message: "Invalid plant code",
    });
  }

  // movement type validation
  if (!/^[A-Za-z0-9]+$/.test(movementType)) {
    return res.status(400).json({
      message: "Invalid movement type",
    });
  }

  // valid UOM check
  const validUoms = ["kg", "liters", "packets", "pieces", "nos"];

  if (!validUoms.includes(baseUom.toLowerCase())) {
    return res.status(400).json({
      message: "Invalid Base UOM",
    });
  }

  const material = await db.Material.create({
    materialCode,
    description,
    baseUom,
    materialType,
    industrySector,
    documentDate,
    plant,
    storageLocation,
    movementType,
  });

  res.status(201).json(material);
});
// PUT /api/materials/:id
exports.updateMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);

  if (!material) {
    return res.status(404).json({
      message: "Material not found",
    });
  }

  let {
    materialCode,
    description,
    baseUom,
    materialType,
    industrySector,
    documentDate,
    plant,
    storageLocation,
    movementType,
  } = req.body;

  // trim values
  materialCode = materialCode?.trim();
  description = description?.trim();
  baseUom = baseUom?.trim();
  materialType = materialType?.trim();
  industrySector = industrySector?.trim();
  plant = plant?.trim();
  storageLocation = storageLocation?.trim();
  movementType = movementType?.trim();

  // required validations
  if (!materialCode) {
    return res.status(400).json({
      message: "Material code is required",
    });
  }

  if (!description) {
    return res.status(400).json({
      message: "Description is required",
    });
  }

  if (!baseUom) {
    return res.status(400).json({
      message: "Base UOM is required",
    });
  }

  if (!materialType) {
    return res.status(400).json({
      message: "Material type is required",
    });
  }

  if (!industrySector) {
    return res.status(400).json({
      message: "Industry sector is required",
    });
  }

  if (!plant) {
    return res.status(400).json({
      message: "Plant is required",
    });
  }

  if (!storageLocation) {
    return res.status(400).json({
      message: "Storage location is required",
    });
  }

  if (!movementType) {
    return res.status(400).json({
      message: "Movement type is required",
    });
  }

  // material code cannot be only 0
  if (materialCode === "0") {
    return res.status(400).json({
      message: "Material code cannot be 0",
    });
  }

  // material code validation
  if (!/^[A-Za-z0-9]+$/.test(materialCode)) {
    return res.status(400).json({
      message: "Invalid material code",
    });
  }

  // plant validation
  if (!/^[A-Za-z0-9]+$/.test(plant)) {
    return res.status(400).json({
      message: "Invalid plant code",
    });
  }

  // movement type validation
  if (!/^[A-Za-z0-9]+$/.test(movementType)) {
    return res.status(400).json({
      message: "Invalid movement type",
    });
  }

  // valid UOM check
  const validUoms = ["kg", "liters", "packets", "pieces", "nos"];

  if (!validUoms.includes(baseUom.toLowerCase())) {
    return res.status(400).json({
      message: "Invalid Base UOM",
    });
  }

  await material.update({
    materialCode,
    description,
    baseUom,
    materialType,
    industrySector,
    documentDate,
    plant,
    storageLocation,
    movementType,
  });

  res.json(material);
});

// DELETE /api/materials/:id  (soft delete)
exports.softDeleteMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: "Material not found" });
    return;
  }
  await material.update({ isDeleted: true });
  res.json({ message: "Material moved to recycle bin" });
});

// PUT /api/materials/:id/restore
exports.restoreMaterial = asyncHandler(async (req, res) => {
  const material = await db.Material.findByPk(req.params.id);
  if (!material) {
    res.status(404).json({ message: "Material not found" });
    return;
  }
  await material.update({ isDeleted: false });
  res.json(material);
});
