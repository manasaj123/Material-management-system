module.exports = (sequelize, DataTypes) => {
  const CreditMemo = sequelize.define('CreditMemo', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    creditMemoNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('AR', 'AP'),
      allowNull: false
    },
    partyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    partyName: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    referenceInvoice: {
      type: DataTypes.STRING(50)
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    taxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255)
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'POSTED', 'CANCELLED'),
      defaultValue: 'DRAFT'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'credit_memos',
    timestamps: true
  });

  return CreditMemo;
};