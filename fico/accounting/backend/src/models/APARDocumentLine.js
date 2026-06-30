// backend/src/models/APARDocumentLine.js
module.exports = (sequelize, DataTypes) => {
  const APARDocumentLine = sequelize.define(
    'APARDocumentLine',
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
      glAccount: {
        type: DataTypes.STRING(20),
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
      },
      taxCode: {
        type: DataTypes.STRING(10),
      },
      assignment: {
        type: DataTypes.STRING(50),
      },
      lineText: {
        type: DataTypes.STRING(255),
      },
      costCenter: {
        type: DataTypes.STRING(20),
      },
      hsnCode: {
        type: DataTypes.STRING(20),
      },
    },
    {
      tableName: 'ap_ar_document_lines',
      timestamps: false,
    }
  );

  APARDocumentLine.associate = (models) => {
    APARDocumentLine.belongsTo(models.APARDocument, {
      as: 'document',
      foreignKey: 'documentId',
    });
  };

  return APARDocumentLine;
};