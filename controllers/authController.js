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


const jwt = require("jsonwebtoken");


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user by email
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

