
const db = require('../config/db');

const Product = {
  async findAll() {
    const [rows] = await db.query('SELECT * FROM products ORDER BY id');
    return rows;
  },
  async create(data) {
    const [res] = await db.query(
      'INSERT INTO products (code, name) VALUES (?, ?)',
      [data.code, data.name]
    );
    return { id: res.insertId };
  }
};

module.exports = Product;
