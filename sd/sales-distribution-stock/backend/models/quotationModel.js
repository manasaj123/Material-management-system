const db = require("../config/db")

const Quotation = {

getAll:(cb)=>{
db.query("SELECT * FROM quotations",cb)
},

create:(data,cb)=>{
db.query("INSERT INTO quotations SET ?",data,cb)
},

update:(id,data,cb)=>{
db.query("UPDATE quotations SET ? WHERE quotation_id=?",[data,id],cb)
},

delete:(id,cb)=>{
db.query("DELETE FROM quotations WHERE quotation_id=?",[id],cb)
}

}

module.exports = Quotation
