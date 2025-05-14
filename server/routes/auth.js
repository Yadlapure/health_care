const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  loginUser,
  ClientUpdateLocation,
} = require("../controllers/authController");


router.route("/login").post(loginUser);
router.route("/:id/location").put(auth, ClientUpdateLocation);

module.exports = router;
