const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Visit = require("../models/Visit");
const geolib = require("geolib");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/check-in", auth, upload.single("photo"), async (req, res) => {
  const { lat, lng, clientId } = req.body;

  const client = await User.findById(clientId);
  if (!client) return res.status(404).json({ message: "Client not found" });

  const isNearby = geolib.isPointWithinRadius(
    { latitude: lat, longitude: lng },
    {
      latitude: client.patientLocation.lat,
      longitude: client.patientLocation.lng,
    },
    200
  );

  if (!isNearby)
    return res.status(400).json({ message: "Not within 200m of client" });

  const visit = await Visit.create({
    clientId,
    practitionerId: req.user.id,
    checkInLocation: { lat, lng },
    checkInPhoto: req.file.path,
    checkInTime: new Date(),
  });

  res.json({ message: "Check-in successful", visit });
});

router.post("/report", auth, async (req, res) => {
  const { visitId, bloodPressure, sugar, notes, prescription } = req.body;

  const visit = await Visit.findByIdAndUpdate(
    visitId,
    {
      report: { bloodPressure, sugar, notes, prescription },
    },
    { new: true }
  );

  res.json({ message: "Report updated", visit });
});

router.post("/check-out", auth, upload.single("photo"), async (req, res) => {
  const { lat, lng, visitId } = req.body;

  const visit = await Visit.findById(visitId);
  const client = await User.findById(visit.clientId);

  const isNearby = geolib.isPointWithinRadius(
    { latitude: lat, longitude: lng },
    {
      latitude: client.patientLocation.lat,
      longitude: client.patientLocation.lng,
    },
    200
  );

  if (!isNearby)
    return res.status(400).json({ message: "Not within 200m of client" });

  visit.checkOutLocation = { lat, lng };
  visit.checkOutPhoto = req.file.path;
  visit.checkOutTime = new Date();
  await visit.save();

  res.json({ message: "Check-out successful", visit });
});

module.exports = router;
