const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");
/*const { createScholarship } = require("../controllers/authController");
const { getScholarships } = require("../controllers/authController");
const { applyScholarship } = require("../controllers/authController");
const { approveApplication } = require("../controllers/authController");
const { getAllApplications } = require("../controllers/authController");
const { getMyApplications } = require("../controllers/authController");
*/

router.post("/register", authController.register);


router.post("/login", authController.login);

router.get(
  "/admin-only",
  verifyToken,
  authorizeRole("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin 👑" });
  }
);
router.get("/my-applications", verifyToken, authController.getMyApplications);
router.get("/applications", verifyToken, authController.getAllApplications);
router.post("/create-scholarship", verifyToken, authController.createScholarship);
router.get("/scholarships", verifyToken, authController.getScholarships);
router.post("/apply/:scholarshipId", verifyToken, authController.applyScholarship);
router.post("/approve/:applicationId", verifyToken, authController.approveApplication);
module.exports = router;
