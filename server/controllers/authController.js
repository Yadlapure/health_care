const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const getDistance = require("../middleware/getDistance");
const Visit = require("../models/Visit");


exports.loginUser = catchAsyncError(async (req, res) => {
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
})

exports.updateLocation = catchAsyncError(async (req, res) => {
  const { lat, lng } = req.body;

  if (req.user.id !== req.params.id) {
    return res
      .status(403)
      .json({ message: "Access denied." });
  }

  if (req.user.role === "client") {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Client not found" });
    }

    user.patientLocation = { lat, lng };
    await user.save();

    res.json({ message: "Location updated", user });
  }

  if (req.user.role === "practitioner") {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Practitioner not found" });
    }

    const clientLat = user.patientLocation.lat
    const clientLng = user.patientLocation.lng
    const distance = getDistance(clientLat, clientLng, lat, lng)

    if (distance <= 50) {

      user.practitionerLocation = { lat, lng };

      await user.save();

      res.json({ message: "Location updated", "status_code": 200 });
    }
    else {
      res.json({ message: "Not within a range", "status_code": 400 })
    }
  }

})

exports.assignId = catchAsyncError(async (req, res) => {
  const assignedUsers = req.body;

  if (req.user.role !== "coordinator") {
    return res
      .status(403)
      .json({ message: "Access denied. Co-ordinator only." });
  }

  assignedUsers.map(async (item) => {
    const client = await User.findById(item.clientId);
    const practitioner = await User.findById(item.practitionerId);

    if (!client || !practitioner) {
      return res.status(404).json({ message: "Client or Practitioner not found" });
    }

    client.assignedId = item.practitionerId;
    practitioner.assignedId = item.clientId;
    practitioner.patientLocation = client.patientLocation

    await client.save()
    await practitioner.save()
  })

  return res.json({ message: "Client and practitioner are assigned", "status_code": 200 });
}
)

exports.getReport = catchAsyncError(async (req, res) => {
  if (req.user.role !== "client") {
    return res
      .status(403)
      .json({ message: "Access denied. Client only." });
  }

  const client = await User.findById(req.user.id);
  const response = client.visitId.map(async(i)=>{        
    const visit = await Visit.findById(i)
    return {
      checkInTime: visit.checkIn.time,
    checkOutTime: visit.checkOut.time,
    report: visit.report
    }
  })
  if(response.length <=0){
    return res.json({message:"No reports"})
  }
  const data = await Promise.all(response);

  return res.json(data)
})