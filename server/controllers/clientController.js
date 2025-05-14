const User = require("../models/User");
const catchAsyncError = require("../middleware/catchAsyncError");
const getDistance = require("../middleware/getDistance");
const Visit = require("../models/Visit");

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

  if (req.user.role === "practitioner" || req.user.role === "nurse" || req.user.role === "caretaker") {
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