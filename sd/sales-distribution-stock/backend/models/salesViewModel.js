const db = require("../config/db");

exports.getAll = cb => db.query("SELECT * FROM sales_view", cb);
exports.create = (data, cb) => db.query("INSERT INTO sales_view SET ?", data, cb);
exports.update = (id, data, cb) => db.query("UPDATE sales_view SET ? WHERE id=?", [data, id], cb);
exports.delete = (id, cb) => db.query("DELETE FROM sales_view WHERE id=?", [id], cb);
