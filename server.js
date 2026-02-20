require("dotenv").config();

const express = require("express");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Scholarship Management System Running 🚀");
});


app.use(express.json());
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      return res.status(500).send("Database error");
    }
    res.send("Database connected successfully ✅");
  });
});

app.use("/api/auth", authRoutes);
app.get("/check", (req, res) => {
  res.send("Check route working");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const { verifyToken } = require("./middleware/authMiddleware");

app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

