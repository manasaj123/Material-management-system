const db = require("../config/db")

const QuotationItem = {

getAll:(cb)=>{
db.query("SELECT * FROM quotation_items",cb)
},

create:(data,cb)=>{
db.query("INSERT INTO quotation_items SET ?",data,cb)
},

update:(id,data,cb)=>{
db.query("UPDATE quotation_items SET ? WHERE quotation_item_id=?",[data,id],cb)
},

delete:(id,cb)=>{
db.query("DELETE FROM quotation_items WHERE quotation_item_id=?",[id],cb)
}

}

module.exports = QuotationItem
