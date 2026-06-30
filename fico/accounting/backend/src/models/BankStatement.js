module.exports = (sequelize, DataTypes) => {
  const BankStatement = sequelize.define('BankStatement', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    bankName: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    statementDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    txnDate: {
      type: DataTypes.DATEONLY,
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
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    matchedPaymentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    matched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'bank_statements',
    timestamps: true
  });

  return BankStatement;
};
