module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    paymentNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    type: {
      // RECEIPT: customer collection, PAYMENT: vendor payment
      type: DataTypes.ENUM('RECEIPT', 'PAYMENT'),
      allowNull: false
    },
    invoiceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    mode: {
      type: DataTypes.ENUM('CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD'),
      allowNull: false
    },
    bankAccountCode: {
      // GL code of bank/cash
      type: DataTypes.STRING(20),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    tdsAmount: {
      // actual TDS deducted on payment if applicable
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    referenceNumber: {
      type: DataTypes.STRING(100)
    },
    remarks: {
      type: DataTypes.STRING(255)
    },
    reconciled: {
      // true when matched with bank statement
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'payments',
    timestamps: true
  });

  return Payment;
};
