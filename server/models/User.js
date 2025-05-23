const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["client", "coordinator", "practitioner","nurse","caretaker"],
    default: "client",
  },
  patientLocation: {
    lat: Number,
    lng: Number,
  },
  practitionerLocation:{
    lat: Number,
    lng: Number,
  },
  assignedId: String,
  visitId: [String]
});

module.exports = mongoose.model("User", userSchema);
