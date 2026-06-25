const { Invoice, Order } = require("../models");

// Create invoice from order
exports.createInvoice = async (req, res) => {
  try {
    const { orderId, customerName, amount, items, status } = req.body;
    
    console.log("Creating invoice with data:", req.body); // Debug log
    
    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get items from order if not provided
    const orderItems = items || order.items || [];
    
    // Calculate amount if not provided
    let invoiceAmount = amount;
    if (!invoiceAmount) {
      if (typeof orderItems === 'string') {
        try {
          const parsedItems = JSON.parse(orderItems);
          invoiceAmount = parsedItems.reduce((sum, it) => sum + (it.quantity * it.price), 0);
        } catch (e) {
          invoiceAmount = order.total || 0;
        }
      } else if (Array.isArray(orderItems)) {
        invoiceAmount = orderItems.reduce((sum, it) => sum + (it.quantity * it.price), 0);
      } else {
        invoiceAmount = order.total || 0;
      }
    }

    // Generate invoice number
    const invoiceCount = await Invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice
    const invoice = await Invoice.create({
      orderId: order.id,
      invoiceNumber: invoiceNumber,
      amount: invoiceAmount,
      status: status || 'PENDING',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    // Update order status to INVOICED
    order.status = "INVOICED";
    await order.save();

    // Return invoice with order details
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: Order
    });

    res.status(201).json(createdInvoice);
  } catch (err) {
    console.error("Create invoice error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to create invoice",
      error: err.toString()
    });
  }
};

// List invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ 
      include: Order,
      order: [["createdAt", "DESC"]]
    });
    res.json(invoices);
  } catch (err) {
    console.error("Get invoices error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Mark invoice as PAID
exports.markInvoicePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "PAID";
    invoice.paidAt = new Date();
    await invoice.save();

    // Return updated invoice with order
    const updatedInvoice = await Invoice.findByPk(id, {
      include: Order
    });

    res.json(updatedInvoice);
  } catch (err) {
    console.error("Mark invoice paid error:", err);
    res.status(500).json({ message: err.message });
  }
};