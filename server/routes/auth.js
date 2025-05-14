const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  loginUser,
  updateLocation,
  assignId,
  getReport
} = require("../controllers/authController");


router.route("/login").post(loginUser);
router.route("/:id/location").put(auth, updateLocation);
router.route("/assign").post(auth,assignId)
router.route("/report").get(auth,getReport)


module.exports = router;
