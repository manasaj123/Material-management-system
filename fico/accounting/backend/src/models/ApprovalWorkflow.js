// models/ApprovalWorkflow.js
module.exports = (sequelize, DataTypes) => {
  const ApprovalWorkflow = sequelize.define(
    'ApprovalWorkflow',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      documentType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'documentType'
      },
      levels: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'levels'
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        field: 'active'
      }
    },
    {
      tableName: 'approval_workflows',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return ApprovalWorkflow;
};