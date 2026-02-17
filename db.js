console.log("File started...");

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "arpita25",
  database: "scolarship_system"
});

connection.connect((err) => {
  if (err) {
    console.log("❌ Error connecting to database:", err);
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

module.exports = connection;
