const db = require("../config/db");

// backend/models/ItemCategoriesConfig.js
module.exports = (sequelize, DataTypes) => {
  const ItemCategoriesConfig = sequelize.define(
    'ItemCategoriesConfig',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      salesDocumentType: { type: DataTypes.STRING(10), allowNull: false },
      itemCategoryGroup: { type: DataTypes.STRING(10), allowNull: false },
      itemUsage: { type: DataTypes.STRING(10) },
      itemCategoryHighLevelItem: { type: DataTypes.STRING(10) },
      defaultItemCategory: { type: DataTypes.STRING(4), allowNull: false },
      manualItemCategory: { type: DataTypes.STRING(4) },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: 'item_categories_configs', timestamps: true }
  );

  return ItemCategoriesConfig;
};