module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    vendorName: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255)
    },
    accountCode: {
      // expense GL account
      type: DataTypes.STRING(20),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    gstRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    gstAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    tdsRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    tdsAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    totalAmount: {
      // amount + GST - TDS
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    costCenterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    profitCenterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'expenses',
    timestamps: true
  });

  return Expense;
};
