// models/Order.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  customerRegion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "[]",
    get() {
      const rawValue = this.getDataValue('items');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [];
        }
      }
      return rawValue || [];
    },
    set(value) {
      if (Array.isArray(value) || typeof value === 'object') {
        this.setDataValue('items', JSON.stringify(value));
      } else {
        this.setDataValue('items', value);
      }
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;