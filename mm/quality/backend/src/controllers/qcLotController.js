// backend/src/controllers/qcLotController.js
// COMPLETE UPDATED VERSION

const { QCLot, QCResult, QCDefect, QCParameter, CAPA, MaterialQCTemplate, sequelize } = require('../models');
const { Op } = require('sequelize');
const integrationHub = require('../services/integrationHubService');

// ============================================
// GET ALL QC LOTS (with filters and pagination)
// ============================================
exports.getAllLots = async (req, res) => {
  try {
    const { 
      status, stage, material_id, vendor_id, 
      from_date, to_date, search, page = 1, limit = 20 
    } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (material_id) where.material_id = material_id;
    if (vendor_id) where.vendor_id = vendor_id;
    if (search) {
      where[Op.or] = [
        { material_name: { [Op.like]: `%${search}%` } },
        { vendor_name: { [Op.like]: `%${search}%` } }
      ];
    }
    if (from_date && to_date) {
      where.planned_date = { [Op.between]: [from_date, to_date] };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await QCLot.findAndCountAll({
      where,
      include: [
        { 
          model: QCResult, 
          as: 'results',
          include: [{ model: QCParameter, as: 'parameter' }],
          limit: 10
        },
        { model: QCDefect, as: 'defects', limit: 5 },
        { model: CAPA, as: 'capas', limit: 3 }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    // Fetch vendor details for each lot
    const lotsWithVendors = await Promise.all(rows.map(async (lot) => {
      const lotData = lot.toJSON();
      if (lot.vendor_id) {
        try {
          const vendor = await integrationHub.getVendorById(lot.vendor_id);
          lotData.vendor = vendor;
        } catch (error) {
          lotData.vendor = null;
        }
      }
      return lotData;
    }));

    const summary = await QCLot.getStatusSummary();
    const stageSummary = await QCLot.getStageSummary();

    res.json({
      success: true,
      data: lotsWithVendors,
      summary,
      stageSummary,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching QC lots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// GET LOTS BY STAGE (In-Process / Final)
// ============================================
exports.getLotsByStage = async (req, res) => {
  try {
    const { stage } = req.params;
    
    if (!['PRODUCTION', 'FINAL', 'FIELD', 'WAREHOUSE'].includes(stage)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid stage. Allowed: PRODUCTION, FINAL, FIELD, WAREHOUSE' 
      });
    }

    const lots = await QCLot.findAll({
      where: { stage: stage },
      include: [
        { 
          model: QCResult, 
          as: 'results',
          include: [{ model: QCParameter, as: 'parameter' }],
          limit: 5
        },
        { model: QCDefect, as: 'defects', limit: 5 },
        { model: CAPA, as: 'capas', limit: 3 }
      ],
      order: [['created_at', 'DESC']]
    });

    // Fetch vendor details
    const lotsWithVendors = await Promise.all(lots.map(async (lot) => {
      const lotData = lot.toJSON();
      if (lot.vendor_id) {
        try {
          const vendor = await integrationHub.getVendorById(lot.vendor_id);
          lotData.vendor = vendor;
        } catch (error) {
          lotData.vendor = null;
        }
      }
      return lotData;
    }));

    res.json({
      success: true,
      data: lotsWithVendors,
      count: lotsWithVendors.length
    });
  } catch (error) {
    console.error('Error fetching lots by stage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// GET SINGLE QC LOT
// ============================================
exports.getLotById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lot = await QCLot.findByPk(id, {
      include: [
        { 
          model: QCResult, 
          as: 'results',
          include: [{ model: QCParameter, as: 'parameter' }],
          order: [['sample_number', 'ASC']]
        },
        { 
          model: QCDefect, 
          as: 'defects',
          order: [['severity', 'DESC']]
        },
        { model: CAPA, as: 'capas' }
      ]
    });

    if (!lot) {
      return res.status(404).json({ success: false, error: 'QC Lot not found' });
    }

    // Fetch vendor details
    let vendor = null;
    if (lot.vendor_id) {
      try {
        vendor = await integrationHub.getVendorById(lot.vendor_id);
      } catch (error) {
        console.error('Error fetching vendor:', error);
      }
    }

    // Fetch inspection plan if material_code exists
    let inspectionPlan = null;
    if (lot.material_id) {
      try {
        const material = await integrationHub.getMaterialById(lot.material_id);
        if (material && material.material_number) {
          inspectionPlan = await integrationHub.getInspectionPlan(material.material_number);
        }
      } catch (error) {
        console.error('Error fetching inspection plan:', error);
      }
    }

    const stats = {
      total_results: lot.results?.length || 0,
      passed: lot.results?.filter(r => r.pass_fail).length || 0,
      failed: lot.results?.filter(r => !r.pass_fail).length || 0,
      total_defects: lot.defects?.length || 0,
      minor_defects: lot.defects?.filter(d => d.severity === 'MINOR').length || 0,
      major_defects: lot.defects?.filter(d => d.severity === 'MAJOR').length || 0,
      critical_defects: lot.defects?.filter(d => d.severity === 'CRITICAL').length || 0,
      capa_count: lot.capas?.length || 0
    };

    const lotData = lot.toJSON();
    lotData.vendor = vendor;
    lotData.inspection_plan = inspectionPlan;

    const needsCAPA = lot.defects?.some(d => d.severity === 'MAJOR' || d.severity === 'CRITICAL') || false;

    res.json({
      success: true,
      data: lotData,
      stats,
      needsCAPA
    });
  } catch (error) {
    console.error('Error fetching QC lot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// CREATE QC LOT
// ============================================
exports.createLot = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const lotData = req.body;
    
    if (!lotData.material_id) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'Material ID is required' });
    }

    // Validate vendor if provided
    let vendorName = null;
    if (lotData.vendor_id) {
      try {
        const vendor = await integrationHub.getVendorById(lotData.vendor_id);
        if (vendor) {
          vendorName = vendor.name;
        } else {
          await transaction.rollback();
          return res.status(400).json({ success: false, error: 'Invalid vendor ID' });
        }
      } catch (error) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: 'Error validating vendor' });
      }
    }

    const lot = await QCLot.create({
      ...lotData,
      vendor_name: vendorName,
      status: 'PENDING',
      planned_date: lotData.planned_date || new Date().toISOString().split('T')[0]
    }, { transaction });

    await transaction.commit();

    // If source_type is INTEGRATION, notify Integration Hub
    if (lotData.source_type === 'INTEGRATION' && lotData.inspection_lot_id) {
      try {
        const material = await integrationHub.getMaterialById(lotData.material_id);
        await integrationHub.notifyQCCreation(
          lot.id, 
          lotData.inspection_lot_id, 
          material?.material_number || lotData.material_id
        );
      } catch (error) {
        console.error('Error notifying Integration Hub:', error);
      }
    }

    res.status(201).json({
      success: true,
      message: 'QC Lot created successfully',
      data: lot
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating QC lot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// RECORD INSPECTION RESULTS
// ============================================
exports.recordResults = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { results, defects, decision, inspected_by, remarks } = req.body;

    const lot = await QCLot.findByPk(id);
    if (!lot) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'QC Lot not found' });
    }

    if (lot.isCompleted()) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: `Cannot update. Lot is already ${lot.status}` 
      });
    }

    const validDecisions = ['ACCEPTED', 'REJECTED', 'ACCEPTED_WITH_DEVIATION'];
    if (!decision || !validDecisions.includes(decision)) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: 'Valid decision is required (ACCEPTED, REJECTED, ACCEPTED_WITH_DEVIATION)' 
      });
    }

    // Save results
    let passedCount = 0;
    let failedCount = 0;
    if (results && results.length > 0) {
      for (const result of results) {
        const parameter = await QCParameter.findByPk(result.parameter_id);
        if (parameter) {
          if (result.pass_fail === undefined || result.pass_fail === null) {
            result.pass_fail = parameter.isWithinSpec(result.measured_value);
          }
        }

        await QCResult.create({
          lot_id: id,
          parameter_id: result.parameter_id,
          sample_number: result.sample_number || 1,
          measured_value: result.measured_value,
          unit: result.unit,
          pass_fail: result.pass_fail,
          remark: result.remark
        }, { transaction });

        if (result.pass_fail) passedCount++;
        else failedCount++;
      }
    }

    // Save defects
    let criticalDefects = 0;
    let majorDefects = 0;
    let capaCreated = false;
    
    if (defects && defects.length > 0) {
      for (const defect of defects) {
        const qcDefect = await QCDefect.create({
          lot_id: id,
          defect_type: defect.defect_type,
          defect_code: defect.defect_code,
          qty_rejected: defect.qty_rejected || 0,
          unit: defect.unit,
          severity: defect.severity || 'MINOR',
          remarks: defect.remarks
        }, { transaction });

        if (defect.severity === 'CRITICAL') criticalDefects++;
        if (defect.severity === 'MAJOR') majorDefects++;

        if (['MAJOR', 'CRITICAL'].includes(defect.severity)) {
          await CAPA.create({
            lot_id: id,
            defect_id: qcDefect.id,
            title: `${defect.severity} Defect: ${defect.defect_type} - ${lot.material_name}`,
            problem_desc: `Defect found during QC inspection of ${lot.material_name}`,
            owner: req.body.capa_owner || 'Quality Manager',
            status: 'OPEN',
            priority: defect.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }, { transaction });
          capaCreated = true;
        }
      }
    }

    // Update lot status
    await lot.update({
      status: decision,
      inspected_date: new Date(),
      inspected_by: inspected_by || req.body.inspected_by || 'System',
      remarks: remarks || null
    }, { transaction });

    await transaction.commit();

    // Notify Integration Hub
    await integrationHub.notifyQCCompletion(id, lot.material_id, lot.vendor_id, decision);

    res.json({
      success: true,
      message: 'Inspection results recorded successfully',
      data: {
        lot_id: id,
        status: decision,
        results: { total: results?.length || 0, passed: passedCount, failed: failedCount },
        defects: { 
          total: defects?.length || 0, 
          critical: criticalDefects, 
          major: majorDefects 
        },
        capa_created: capaCreated
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error recording results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// UPDATE STATUS
// ============================================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED', 'ACCEPTED_WITH_DEVIATION'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const lot = await QCLot.findByPk(id);
    if (!lot) {
      return res.status(404).json({ success: false, error: 'QC Lot not found' });
    }

    await lot.update({ status });
    res.json({ success: true, message: 'Status updated successfully', data: lot });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// DELETE QC LOT
// ============================================
exports.deleteLot = async (req, res) => {
  try {
    const { id } = req.params;
    const lot = await QCLot.findByPk(id);
    
    if (!lot) {
      return res.status(404).json({ success: false, error: 'QC Lot not found' });
    }

    await lot.destroy();
    res.json({ success: true, message: 'QC Lot deleted successfully' });
  } catch (error) {
    console.error('Error deleting QC lot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// GET VENDORS LIST
// ============================================
exports.getVendorsList = async (req, res) => {
  try {
    const vendors = await integrationHub.getAllVendors();
    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// VALIDATE VENDOR
// ============================================
exports.validateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const isValid = await integrationHub.validateVendor(vendorId);
    res.json({ success: true, valid: isValid });
  } catch (error) {
    console.error('Error validating vendor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};