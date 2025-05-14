const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["client", "coordinator", "practitioner"],
    default: "client",
  },
  patientLocation: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.model("User", userSchema);
