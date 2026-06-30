// src/models/DownPayment.js
module.exports = (sequelize, DataTypes) => {
  const DownPayment = sequelize.define('DownPayment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    downPaymentNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    partyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    partyName: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('AR', 'AP'), // customer / vendor
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reference: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'POSTED', 'CANCELLED'),
      defaultValue: 'POSTED'
    },
    clearedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    balanceAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'down_payments',
    timestamps: true
  });

  return DownPayment;
};