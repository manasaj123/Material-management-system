// backend/src/models/AssetClass.js
module.exports = (sequelize, DataTypes) => {
  const AssetClass = sequelize.define(
    'AssetClass',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(160), allowNull: false },
      assetType: {
        type: DataTypes.ENUM('TANGIBLE', 'INTANGIBLE'),
        allowNull: false,
        defaultValue: 'TANGIBLE',
      },
      depreciationArea: { type: DataTypes.STRING(20) },
      usefulLifeYears: { type: DataTypes.INTEGER },
      glAccountAsset: { type: DataTypes.STRING(20) },
      glAccountAccumDep: { type: DataTypes.STRING(20) },
      glAccountExpense: { type: DataTypes.STRING(20) },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'asset_classes',
      timestamps: false,
    }
  );

  return AssetClass;
};