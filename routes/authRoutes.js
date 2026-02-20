const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
const { createScholarship } = require("../controllers/authController");
const { getScholarships } = require("../controllers/authController");
router.post("/register", authController.register);

module.exports = router;
router.post("/login", authController.login);

router.get(
  "/admin-only",
  verifyToken,
  authorizeRole("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin 👑" });
  }
);

router.post("/create-scholarship", verifyToken, createScholarship);
router.get("/scholarships", verifyToken, getScholarships);


