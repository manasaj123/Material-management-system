// backend/src/models/APAROpenItem.js
module.exports = (sequelize, DataTypes) => {
  const APAROpenItem = sequelize.define(
    'APAROpenItem',
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
      documentNumber: {
        type: DataTypes.STRING(50),
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
      },
      selected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'ap_ar_open_items',
      timestamps: false,
    }
  );

  APAROpenItem.associate = (models) => {
    APAROpenItem.belongsTo(models.APARDocument, {
      as: 'document',
      foreignKey: 'documentId',
    });
  };

  return APAROpenItem;
};