const { Delivery, Order } = require("../models");
const { Op } = require("sequelize");

exports.createDelivery = async (req, res) => {
  try {
    const { orderId, address, status, trackingNumber, estimatedDelivery } = req.body;
    
    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({
      where: {
        orderId: orderId,
        status: {
          [Op.notIn]: ['DELIVERED', 'CANCELLED']
        }
      }
    });
    
    if (existingDelivery) {
      return res.status(400).json({ 
        message: `A delivery already exists for Order #${orderId} with status: ${existingDelivery.status}. Please update the existing delivery instead.` 
      });
    }
    
    const deliveryData = {
      orderId,
      status: status || 'OUT_FOR_DELIVERY',
    };
    
    if (address) {
      deliveryData.address = address;
    }
    
    if (trackingNumber) deliveryData.trackingNumber = trackingNumber;
    if (estimatedDelivery) deliveryData.estimatedDelivery = estimatedDelivery;
    
    const delivery = await Delivery.create(deliveryData);
    res.status(201).json(delivery);
  } catch (err) {
    console.error("Create delivery error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, address, status, trackingNumber, estimatedDelivery } = req.body;
    
    const delivery = await Delivery.findByPk(id);
    
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    
    // If changing orderId, check if new order already has a delivery
    if (orderId !== undefined && orderId != delivery.orderId) {
      const existingDelivery = await Delivery.findOne({
        where: {
          orderId: orderId,
          id: { [Op.ne]: id },
          status: {
            [Op.notIn]: ['DELIVERED', 'CANCELLED']
          }
        }
      });
      
      if (existingDelivery) {
        return res.status(400).json({ 
          message: `Order #${orderId} already has an active delivery.` 
        });
      }
    }
    
    if (orderId !== undefined) delivery.orderId = orderId;
    if (address !== undefined) delivery.address = address;
    if (status !== undefined) {
      delivery.status = status;
      if (status === "DELIVERED") {
        delivery.deliveredAt = new Date();
      }
    }
    if (trackingNumber !== undefined) delivery.trackingNumber = trackingNumber;
    if (estimatedDelivery !== undefined) delivery.estimatedDelivery = estimatedDelivery;
    
    await delivery.save();
    
    if (status === "DELIVERED") {
      const order = await Order.findByPk(delivery.orderId);
      if (order) {
        order.status = "DELIVERED";
        await order.save();
      }
    }
    
    const updatedDelivery = await Delivery.findByPk(id, {
      include: Order
    });
    
    res.json(updatedDelivery);
  } catch (err) {
    console.error("Update delivery error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Not found" });

    delivery.status = req.body.status;
    delivery.deliveredAt = req.body.deliveredAt || delivery.deliveredAt;
    await delivery.save();

    if (delivery.status === "DELIVERED") {
      const order = await Order.findByPk(delivery.orderId);
      if (order) {
        order.status = "DELIVERED";
        await order.save();
      }
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({ 
      include: Order,
      order: [["createdAt", "DESC"]]
    });
    res.json(deliveries);
  } catch (err) {
    console.error("Get deliveries error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add this function to get orders without active deliveries
exports.getOrdersWithoutDelivery = async (req, res) => {
  try {
    // Get all orderIds that have active deliveries
    const activeDeliveries = await Delivery.findAll({
      where: {
        status: {
          [Op.notIn]: ['DELIVERED', 'CANCELLED']
        }
      },
      attributes: ['orderId']
    });
    
    const activeOrderIds = activeDeliveries.map(d => d.orderId);
    
    // Get orders that don't have active deliveries
    const orders = await Order.findAll({
      where: {
        id: {
          [Op.notIn]: activeOrderIds
        },
        status: {
          [Op.notIn]: ['CANCELLED']
        }
      },
      order: [["createdAt", "DESC"]]
    });
    
    res.json(orders);
  } catch (err) {
    console.error("Get available orders error:", err);
    res.status(500).json({ message: err.message });
  }
};