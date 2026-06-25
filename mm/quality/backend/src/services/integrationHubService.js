// backend/src/services/integrationHubService.js
// NEW - Integration Hub API Client

const axios = require('axios');
require('dotenv').config();

const INTEGRATION_HUB_URL = process.env.INTEGRATION_HUB_URL || 'http://localhost:3000';
const MM_CREATION_URL = process.env.MM_CREATION_URL || 'http://localhost:5002';
const INSPECTION_URL = process.env.INSPECTION_URL || 'http://localhost:5003';

class IntegrationHubService {
  constructor() {
    this.hubUrl = INTEGRATION_HUB_URL;
    this.mmCreationUrl = MM_CREATION_URL;
    this.inspectionUrl = INSPECTION_URL;
  }

  // ============================================
  // VENDOR METHODS
  // ============================================
  
  // Get vendor by ID from MM Creation
  async getVendorById(vendorId) {
    try {
      const response = await axios.get(`${this.mmCreationUrl}/api/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor:', error.message);
      return null;
    }
  }

  // Get all vendors
  async getAllVendors() {
    try {
      const response = await axios.get(`${this.mmCreationUrl}/api/vendors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error.message);
      return [];
    }
  }

  // Validate vendor exists
  async validateVendor(vendorId) {
    try {
      const vendor = await this.getVendorById(vendorId);
      return vendor !== null;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // MATERIAL METHODS
  // ============================================
  
  // Get material details
  async getMaterialById(materialId) {
    try {
      const response = await axios.get(`${this.mmCreationUrl}/api/materials/${materialId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material:', error.message);
      return null;
    }
  }

  // Get material by code
  async getMaterialByCode(materialCode) {
    try {
      const response = await axios.get(`${this.mmCreationUrl}/api/materials/code/${materialCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material by code:', error.message);
      return null;
    }
  }

  // ============================================
  // INSPECTION PLAN METHODS
  // ============================================
  
  // Get inspection plan from Inspection module
  async getInspectionPlan(materialCode) {
    try {
      const response = await axios.get(`${this.inspectionUrl}/api/integration/inspection-plan/${materialCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspection plan:', error.message);
      return null;
    }
  }

  // ============================================
  // NOTIFICATION METHODS
  // ============================================
  
  // Notify Integration Hub about QC completion
  async notifyQCCompletion(lotId, materialId, vendorId, status) {
    try {
      await axios.post(`${this.hubUrl}/webhook/qc-lot-completed`, {
        qc_lot_id: lotId,
        material_id: materialId,
        vendor_id: vendorId,
        status: status,
        completed_date: new Date().toISOString()
      });
      console.log(`✅ Notified Integration Hub: QC Lot ${lotId} → ${status}`);
    } catch (error) {
      console.error('Error notifying Integration Hub:', error.message);
    }
  }

  // Notify Integration Hub about QC lot creation
  async notifyQCCreation(lotId, inspectionLotId, materialCode) {
    try {
      await axios.post(`${this.hubUrl}/webhook/qc-lot-created`, {
        qc_lot_id: lotId,
        inspection_lot_id: inspectionLotId,
        material_code: materialCode,
        status: 'PENDING'
      });
      console.log(`✅ Notified Integration Hub: QC Lot ${lotId} created`);
    } catch (error) {
      console.error('Error notifying Integration Hub:', error.message);
    }
  }

  // ============================================
  // BATCH METHODS
  // ============================================
  
  // Get batch details
  async getBatchById(batchId) {
    try {
      const response = await axios.get(`${this.mmCreationUrl}/api/batches/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch:', error.message);
      return null;
    }
  }
}

module.exports = new IntegrationHubService();