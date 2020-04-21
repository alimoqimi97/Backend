const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ali@real@sharif@2223"
});


module.exports = function createDataBase(dbname){

    con.query("CREATE DATABASE " + dbname + ";",(err,results) => {
        if(err){
            throw err;
        }
        console.log("database " + dbname + " created.");
    });

}

module.exports = function createTable(tblname,fields,types){

    let allelems = fields.join(" , ");

    con.query("CREATE TABLE " + tblname + " (" + allelems + ");")
}

