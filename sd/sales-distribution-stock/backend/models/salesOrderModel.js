const db = require("../config/db")

const SalesOrder = {

getAll:(cb)=>{
db.query("SELECT * FROM sales_orders",cb)
},

create:(data,cb)=>{
db.query("INSERT INTO sales_orders SET ?",data,cb)
},

update:(id,data,cb)=>{
db.query("UPDATE sales_orders SET ? WHERE sales_order_id=?",[data,id],cb)
},

delete:(id,cb)=>{
db.query("DELETE FROM sales_orders WHERE sales_order_id=?",[id],cb)
}

}

module.exports = SalesOrder
