const { connection } = require("mongoose");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "starrdb",
  port : "3306"
});

conn.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(" DB connection sucessful");
  }
});

module.exports = conn;
