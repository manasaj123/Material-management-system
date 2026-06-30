// backend/src/models/APARWithholdingTax.js
module.exports = (sequelize, DataTypes) => {
  const APARWithholdingTax = sequelize.define(
    'APARWithholdingTax',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      taxType: {
        type: DataTypes.STRING(10),
      },
      taxCode: {
        type: DataTypes.STRING(10),
      },
      taxAmount: {
        type: DataTypes.DECIMAL(15, 2),
      },
    },
    {
      tableName: 'ap_ar_withholding_taxes',
      timestamps: false,
    }
  );

  APARWithholdingTax.associate = (models) => {
    APARWithholdingTax.belongsTo(models.APARDocument, {
      as: 'document',
      foreignKey: 'documentId',
    });
  };

  return APARWithholdingTax;
};