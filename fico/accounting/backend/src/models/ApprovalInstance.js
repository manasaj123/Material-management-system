// backend/src/models/ApprovalInstance.js
module.exports = (sequelize, DataTypes) => {
  const ApprovalInstance = sequelize.define('ApprovalInstance', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    documentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    documentType: {
      type: DataTypes.ENUM(
        'INVOICE',
        'PAYMENT',
        'JOURNAL',
        'CREDIT_MEMO',
        'DOWN_PAYMENT',
        'PURCHASE_ORDER'
      ),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2)
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    currentLevel: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1
    },
    workflowId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    approvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'approval_instances',
    timestamps: true
  });

  return ApprovalInstance;
};