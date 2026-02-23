console.log("Auth Controller Loaded");

const db = require("../db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { name, email, password, roll_no, cgpa, family_income } = req.body;
  const role = "student";

  if (!name || !email || !password || !roll_no || !cgpa || !family_income) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users 
      (name, email, password, role, roll_no, cgpa, family_income)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [name, email, hashedPassword, role, roll_no, cgpa, family_income],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "User already exists or DB error" });
        }

        res.status(201).json({ message: "User registered successfully ✅" });
      }
    );

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
console.log("USER ID FROM DB:", user.id);
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

exports.createScholarship = (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    title,
    description,
    amount,
    min_cgpa,
    max_income,
    total_seats,
    deadline
  } = req.body;

  const sql = `
    INSERT INTO scholarships
    (title, description, amount, min_cgpa, max_income, total_seats, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, amount, min_cgpa, max_income, total_seats, deadline],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      res.status(201).json({ message: "Scholarship created successfully" });
    }
  );
};

exports.getScholarships = (req, res) => {
  const sql = "SELECT * FROM scholarships";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
};
exports.applyScholarship = async (req, res) => {
  const userId = req.user.id;   // make sure this matches your JWT
  const scholarshipId = req.params.scholarshipId;

  try {
    // 1️⃣ Get student details
    const [userRows] = await db.promise().query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    // 2️⃣ Get scholarship details
    const [scholarshipRows] = await db.promise().query(
      "SELECT * FROM scholarships WHERE id = ?",
      [scholarshipId]
    );

    if (scholarshipRows.length === 0) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    const scholarship = scholarshipRows[0];

    // 3️⃣ Eligibility Check
    if (user.cgpa < scholarship.min_cgpa) {
      return res.status(400).json({ message: "Not eligible: CGPA too low" });
    }

    if (user.family_income > scholarship.max_income) {
      return res.status(400).json({ message: "Not eligible: Income too high" });
    }

    // 4️⃣ Insert application
    await db.promise().query(
      "INSERT INTO applications (user_id, scholarship_id) VALUES (?, ?)",
      [userId, scholarshipId]
    );

    res.status(201).json({ message: "Application submitted successfully" });

  } catch (err) {
    console.log("DB ERROR:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "You already applied" });
    }

    res.status(500).json({ message: "Database error" });
  }
};