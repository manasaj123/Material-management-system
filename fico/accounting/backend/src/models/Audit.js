module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define('Audit', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    entityId: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    details: {
      type: DataTypes.JSON
    },
    ipAddress: {
      type: DataTypes.STRING(60)
    },
    userAgent: {
      type: DataTypes.STRING(255)
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true
  });

  return Audit;
};
