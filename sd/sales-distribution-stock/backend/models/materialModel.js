const db = require("../config/db")

const Material = {

getAll:(callback)=>{
db.query("SELECT * FROM material_stock",callback)
},

create:(data,callback)=>{
db.query("INSERT INTO material_stock SET ?",data,callback)
},

update:(id,data,callback)=>{
db.query("UPDATE material_stock SET ? WHERE material_id=?",[data,id],callback)
},

delete:(id,callback)=>{
db.query("DELETE FROM material_stock WHERE material_id=?",[id],callback)
}

}

module.exports = Material
