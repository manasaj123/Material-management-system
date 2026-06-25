// models/index.js
const { sequelize } = require("../config/db");
const User = require("./User");
const Order = require("./Order");
const Delivery = require("./Delivery");
const Invoice = require("./Invoice");

// Relations
User.hasMany(Order, { 
  foreignKey: "userId",
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Order.belongsTo(User, { 
  foreignKey: "userId" 
});

Order.hasOne(Delivery, { 
  foreignKey: "orderId",
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Delivery.belongsTo(Order, { 
  foreignKey: "orderId" 
});

Order.hasOne(Invoice, { 
  foreignKey: "orderId",
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Invoice.belongsTo(Order, { 
  foreignKey: "orderId" 
});

// Sync database (optional - you can sync in server.js instead)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false }); // Set to true if you want to auto-update tables
    console.log("All models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
};

module.exports = { 
  sequelize, 
  User, 
  Order, 
  Delivery, 
  Invoice,
  syncDatabase 
};