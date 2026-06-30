// backend/src/models/AccDocument.js
module.exports = (sequelize, DataTypes) => {
  const AccDocument = sequelize.define(
    'AccDocument',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      documentNumber: { type: DataTypes.STRING(20), allowNull: false },
      companyCode: { type: DataTypes.STRING(10), allowNull: false },
      fiscalYear: { type: DataTypes.INTEGER, allowNull: false },
      documentDate: { type: DataTypes.DATEONLY, allowNull: false },
      postingDate: { type: DataTypes.DATEONLY, allowNull: false },
      documentType: { type: DataTypes.STRING(4) },
      entryDate: { type: DataTypes.DATEONLY },
      period: { type: DataTypes.TINYINT, allowNull: false },
      reference: { type: DataTypes.STRING(50) },
      referenceTransaction: { type: DataTypes.STRING(10) },
      referenceKey: { type: DataTypes.STRING(30) },
      crossCompNumber: { type: DataTypes.STRING(20) },
      currency: { type: DataTypes.STRING(3), allowNull: false },
      text: { type: DataTypes.STRING(255) },
      ledgerGroup: { type: DataTypes.STRING(10) },
      logicalSystem: { type: DataTypes.STRING(20) },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'acc_documents',
      timestamps: false,
    }
  );
  return AccDocument;
};