const db = require("../config/db")

const Billing = {

getAll:(cb)=>{
db.query("SELECT * FROM billing",cb)
},

create:(data,cb)=>{
db.query("INSERT INTO billing SET ?",data,cb)
},

update:(id,data,cb)=>{
db.query("UPDATE billing SET ? WHERE billing_id=?",[data,id],cb)
},

delete:(id,cb)=>{
db.query("DELETE FROM billing WHERE billing_id=?",[id],cb)
}

}

module.exports = Billing
