import db from "../db.js";

export const createOrder = (req, res) => {
  const { items, subtotal, extraDiscount, grandTotal, customerName } = req.body;

  const orderSql =
    "INSERT INTO orders (customer_name, subtotal, extra_discount, grand_total) VALUES (?,?,?,?)";

  db.query(
    orderSql,
    [customerName || null, subtotal, extraDiscount, grandTotal],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const orderId = result.insertId;

      const itemSql =
        "INSERT INTO order_items (order_id, product_name, price, discount, image) VALUES ?";

      const values = items.map((i) => [
        orderId,
        i.name,
        i.price,
        i.discount || 0,
        i.image,
      ]);

      db.query(itemSql, [values], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ orderId });
      });
    }
  );
};

export const getOrderById = (req, res) => {
  const orderId = req.params.id;

  const sql = `
    SELECT o.*, i.*
    FROM orders o
    JOIN order_items i ON o.id = i.order_id
    WHERE o.id = ?
  `;

  db.query(sql, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
