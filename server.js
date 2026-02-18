const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Scholarship Management System Running 🚀");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      return res.status(500).send("Database error");
    }
    res.send("Database connected successfully ✅");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


