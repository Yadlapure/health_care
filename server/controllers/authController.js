const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.loginUser = async (req, res) => {
  const { mobile, password, name } = req.body;

  if (!mobile || !password) {
    return res
      .status(400)
      .json({ message: "Mobile and password are required" });
  }

  try {
    let user = await User.findOne({ mobile });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name: name || "Client User",
        mobile,
        password: hashedPassword,
        role: "client",
      });

      await user.save();
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    console.error("Login error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}



exports.ClientUpdateLocation = async (req, res) => {    
  const { lat, lng } = req.body;

  if (req.user.role !== "client" || req.user.id !== req.params.id) {
    return res
      .status(403)
      .json({ message: "Access denied. Client only." });
  }

  const user = await User.findById(req.params.id);  

  if (!user) {
    return res.status(404).json({ message: "Client not found" });
  }

  user.patientLocation = { lat, lng };
  await user.save();

  res.json({ message: "Client location updated", user });
}
   