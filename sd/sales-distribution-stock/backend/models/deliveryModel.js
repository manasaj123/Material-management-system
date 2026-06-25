const db = require("../config/db")

const Delivery = {

getAll:(cb)=>{
db.query("SELECT * FROM outbound_delivery",cb)
},

create:(data,cb)=>{
db.query("INSERT INTO outbound_delivery SET ?",data,cb)
},

update:(id,data,cb)=>{
db.query("UPDATE outbound_delivery SET ? WHERE delivery_id=?",[data,id],cb)
},

delete:(id,cb)=>{
db.query("DELETE FROM outbound_delivery WHERE delivery_id=?",[id],cb)
}

}

module.exports = Delivery
