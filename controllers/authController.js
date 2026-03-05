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
      role: user.role
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
        console.log("CREATE SCHOLARSHIP ERROR:", err);
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

exports.approveApplication = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const applicationId = req.params.applicationId;

  try {
    // 1️⃣ Get application
    const [appRows] = await db.promise().query(
      "SELECT * FROM applications WHERE id = ?",
      [applicationId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = appRows[0];

    // Optional: prevent re-approval
    if (application.status === "approved") {
      return res.status(400).json({ message: "Already approved" });
    }

    // 2️⃣ Get scholarship
    const [schRows] = await db.promise().query(
      "SELECT * FROM scholarships WHERE id = ?",
      [application.scholarship_id]
    );

    if (schRows.length === 0) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    const scholarship = schRows[0];

    // 3️⃣ Count approved
    const [countRows] = await db.promise().query(
      "SELECT COUNT(*) as total FROM applications WHERE scholarship_id = ? AND status = 'approved'",
      [application.scholarship_id]
    );

    if (countRows[0].total >= scholarship.total_seats) {
      return res.status(400).json({ message: "No seats available" });
    }

    // 4️⃣ Approve
    await db.promise().query(
      "UPDATE applications SET status = 'approved' WHERE id = ?",
      [applicationId]
    );

    res.json({ message: "Application approved successfully 🎉" });

  } catch (err) {
    console.log("APPROVAL ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getAllApplications = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const [rows] = await db.promise().query(`
      SELECT 
        applications.id,
        users.name AS student_name,
        users.email,
        scholarships.title,
        applications.status,
        applications.applied_at
      FROM applications
      JOIN users ON applications.user_id = users.id
      JOIN scholarships ON applications.scholarship_id = scholarships.id
    `);

    res.json(rows);

  } catch (err) {
    console.log("FETCH APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(`
      SELECT 
        applications.id,
        scholarships.title,
        applications.status,
        applications.applied_at
      FROM applications
      JOIN scholarships 
        ON applications.scholarship_id = scholarships.id
      WHERE applications.user_id = ?
    `, [userId]);

    res.json(rows);

  } catch (err) {
    console.log("MY APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
};
