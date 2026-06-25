const { sequelize, Order } = require("../models");
const { QueryTypes } = require("sequelize");

exports.salesByCustomer = async (req, res) => {
  try {
    const orders = await Order.findAll();
    const map = {};
    
    orders.forEach((o) => {
      const customer = o.customerName || "Unknown";
      let items = o.items || [];
      
      // Parse items if it's a string
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          items = [];
        }
      }
      
      // Calculate total from items
      let amount = 0;
      if (Array.isArray(items)) {
        amount = items.reduce((sum, it) => {
          return sum + (Number(it.quantity || 0) * Number(it.price || 0));
        }, 0);
      } else if (o.total) {
        amount = Number(o.total);
      }
      
      map[customer] = (map[customer] || 0) + amount;
    });
    
    const result = Object.entries(map).map(([customer, totalSales]) => ({
      customer,
      totalSales
    }));
    
    // Sort by total sales (highest first)
    result.sort((a, b) => b.totalSales - a.totalSales);
    
    res.json(result);
  } catch (err) {
    console.error("Sales by customer error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.salesByRegion = async (req, res) => {
  try {
    const orders = await Order.findAll();
    const map = {};
    
    orders.forEach((o) => {
      const region = o.customerRegion || "Unknown";
      let items = o.items || [];
      
      // Parse items if it's a string
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          items = [];
        }
      }
      
      // Calculate total from items
      let amount = 0;
      if (Array.isArray(items)) {
        amount = items.reduce((sum, it) => {
          return sum + (Number(it.quantity || 0) * Number(it.price || 0));
        }, 0);
      } else if (o.total) {
        amount = Number(o.total);
      }
      
      map[region] = (map[region] || 0) + amount;
    });
    
    const result = Object.entries(map).map(([region, totalSales]) => ({
      region,
      totalSales
    }));
    
    // Sort by total sales (highest first)
    result.sort((a, b) => b.totalSales - a.totalSales);
    
    res.json(result);
  } catch (err) {
    console.error("Sales by region error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add summary report
exports.salesSummary = async (req, res) => {
  try {
    const orders = await Order.findAll();
    
    let totalSales = 0;
    let totalOrders = orders.length;
    let totalItems = 0;
    
    orders.forEach((o) => {
      let items = o.items || [];
      
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          items = [];
        }
      }
      
      if (Array.isArray(items)) {
        totalItems += items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
        totalSales += items.reduce((sum, it) => {
          return sum + (Number(it.quantity || 0) * Number(it.price || 0));
        }, 0);
      } else if (o.total) {
        totalSales += Number(o.total);
      }
    });
    
    res.json({
      totalOrders,
      totalItems,
      totalSales,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    });
  } catch (err) {
    console.error("Sales summary error:", err);
    res.status(500).json({ message: err.message });
  }
};