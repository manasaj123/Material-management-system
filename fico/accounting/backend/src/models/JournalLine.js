// backend/src/models/JournalLine.js
module.exports = (sequelize, DataTypes) => {
  const JournalLine = sequelize.define(
    'JournalLine',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      journalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lineNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      glAccount: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      debit: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      credit: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      costCenterId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      profitCenterId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      narration: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'journal_lines',
      timestamps: false,
    }
  );

  JournalLine.associate = (models) => {
    JournalLine.belongsTo(models.JournalHeader, {
      as: 'header',
      foreignKey: 'journalId',
    });
  };

  return JournalLine;
};