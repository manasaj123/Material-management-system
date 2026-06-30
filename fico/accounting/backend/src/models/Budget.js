// backend/src/models/budget.js
module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define(
    'Budget',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      month: {
        // 1-12
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      accountCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      costCenterId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      profitCenterId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      budgetAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'budgets',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['year', 'month', 'accountCode', 'costCenterId', 'profitCenterId'],
        },
      ],
    }
  );

  return Budget;
};