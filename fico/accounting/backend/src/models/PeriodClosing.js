module.exports = (sequelize, DataTypes) => {
  const PeriodClosing = sequelize.define('PeriodClosing', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    period: {
      type: DataTypes.STRING(20), // YYYY-MM or YYYY
      unique: true,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED', 'LOCKED'),
      defaultValue: 'OPEN'
    },
    closedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    closedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    depreciationRun: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accrualsPosted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'period_closing',
    timestamps: true
  });

  return PeriodClosing;
};