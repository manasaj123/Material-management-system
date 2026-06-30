module.exports = (sequelize, DataTypes) => {
  const Clearing = sequelize.define('Clearing', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    invoiceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'invoices', key: 'id' }
    },
    paymentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'payments', key: 'id' }
    },
    clearedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    clearingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'clearings',
    timestamps: false
  });

  Clearing.associate = (models) => {
    Clearing.belongsTo(models.Invoice, { foreignKey: 'invoiceId' });
    Clearing.belongsTo(models.Payment, { foreignKey: 'paymentId' });
  };

  return Clearing;
};