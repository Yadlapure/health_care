const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  checkInLocation: { lat: Number, lng: Number },
  checkInPhoto: String,
  checkInTime: Date,

  checkOutLocation: { lat: Number, lng: Number },
  checkOutPhoto: String,
  checkOutTime: Date,

  report: {
    bloodPressure: String,
    sugar: String,
    notes: String,
    prescription: String,
  },
});

module.exports = mongoose.model("Visit", visitSchema);
