console.log("Auth Controller Loaded");

const db = require("../db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(query, [name, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "User already exists or DB error" });
      }

      res.status(201).json({ message: "User registered successfully ✅" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
