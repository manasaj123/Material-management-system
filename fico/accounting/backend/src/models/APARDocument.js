// backend/src/models/APARDocument.js
module.exports = (sequelize, DataTypes) => {
  const APARDocument = sequelize.define(
    'APARDocument',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // What kind of business document?
      // 'INV','CM','INV_PARK','CM_PARK','DP','DP_CLR',
      // 'INC_PAY','OUT_PAY','PWC','REC'
      docType: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      // AP = vendor side, AR = customer side
      partyType: {
        type: DataTypes.ENUM('AP', 'AR'),
        allowNull: false,
      },

      // Vendor code or customer code (generic)
      partyCode: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      // Posted vs parked
      status: {
        type: DataTypes.ENUM('PARKED', 'POSTED'),
        allowNull: false,
        defaultValue: 'PARKED',
      },

      postingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      documentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      baselineDate: {
        type: DataTypes.DATEONLY,
      },

      reference: {
        type: DataTypes.STRING(50),
      },

      headerText: {
        type: DataTypes.STRING(255),
      },

      businessPlace: {
        type: DataTypes.STRING(30),
      },

      sectionCode: {
        type: DataTypes.STRING(20),
      },

      // For VendorCreditMemo, ParkVendorCreditMemo
      invoiceReference: {
        type: DataTypes.STRING(50),
      },

      // Bank/payment fields (DownPayment, Incoming/Outgoing payment)
      bankAccount: {
        type: DataTypes.STRING(30),
      },

      paymentMethod: {
        type: DataTypes.STRING(10),
      },

      // DownPaymentClearing etc.
      clearingDate: {
        type: DataTypes.DATEONLY,
      },

      invoiceNumber: {
        type: DataTypes.STRING(50),
      },

      downPaymentNumber: {
        type: DataTypes.STRING(50),
      },

      clearingAmount: {
        type: DataTypes.DECIMAL(15, 2),
      },

      remainingAmount: {
        type: DataTypes.DECIMAL(15, 2),
      },

      // For Incoming/Outgoing payment adjustments
      advanceAmount: {
        type: DataTypes.DECIMAL(15, 2),
      },

      balanceAmount: {
        type: DataTypes.DECIMAL(15, 2),
      },

      // Recurring document
      startDate: {
        type: DataTypes.DATEONLY,
      },

      endDate: {
        type: DataTypes.DATEONLY,
      },

      frequency: {
        type: DataTypes.STRING(20),
      },

      // Main header amount
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'ap_ar_documents',
      timestamps: true,
    }
  );

  APARDocument.associate = (models) => {
    APARDocument.hasMany(models.APARDocumentLine, {
      as: 'lines',
      foreignKey: 'documentId',
    });
    APARDocument.hasMany(models.APARWithholdingTax, {
      as: 'withholdingTaxes',
      foreignKey: 'documentId',
    });
    APARDocument.hasMany(models.APAROpenItem, {
      as: 'openItems',
      foreignKey: 'documentId',
    });
  };

  return APARDocument;
};