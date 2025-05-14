const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  practitionerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  // coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  checkIn: {
    photo: String,
    time: Date,
  },

  checkOut: {
    photo: String,
    time: Date,
  },

  report: {
    bloodPressure: String,
    sugar: String,
    notes: String,
    prescription_images: [{
      imgUrl: String
    }],
  },
});

module.exports = mongoose.model("Visit", visitSchema);
