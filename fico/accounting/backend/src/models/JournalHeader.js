// backend/src/models/JournalHeader.js
module.exports = (sequelize, DataTypes) => {
  const JournalHeader = sequelize.define(
    'JournalHeader',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      documentNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      documentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      postingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      documentType: {
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: 'SA',
      },
      reference: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      headerText: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      companyCode: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'POSTED',
      },
      createdBy: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'SYSTEM',
      },
    },
    {
      tableName: 'journal_headers',
      timestamps: false,
    }
  );

  JournalHeader.associate = (models) => {
    JournalHeader.hasMany(models.JournalLine, {
      as: 'lines',
      foreignKey: 'journalId',
    });
  };

  return JournalHeader;
};