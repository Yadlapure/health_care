const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require('cloudinary');
const app = express();
require("dotenv").config();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const user = require("./routes/auth");
const practitioner = require("./routes/practitioner");


app.use("/api/v1/user", user);
app.use("/api/v1/practitioner", practitioner);

app.listen(4000, () => console.log("Server running on port 4000"));
