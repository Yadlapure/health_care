const express = require("express");
const mongoose = require("mongoose");
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


  //route imports
const user = require("./routes/auth");
const practioner = require("./routes/practitioner");


app.use("/api/v1", user);
app.use("/api/v1", practioner);

app.listen(4000, () => console.log("Server running on port 4000"));
