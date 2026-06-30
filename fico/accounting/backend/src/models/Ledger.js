module.exports = (sequelize, DataTypes) => {
  const Ledger = sequelize.define('Ledger', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    accountCode: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255)
    },
    debit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    credit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    referenceType: {
      type: DataTypes.ENUM('INVOICE', 'PAYMENT', 'EXPENSE', 'BANK', 'OPENING', 'ADJUSTMENT'),
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING(50)
    },
    invoiceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    paymentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    expenseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    bankStatementId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
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
    tableName: 'ledger',
    timestamps: true
  });

  return Ledger;
};
