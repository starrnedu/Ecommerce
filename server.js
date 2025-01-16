require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const my_Route = require("./controller/my_Route.js");
const path = require("path");
const mongoose = require("mongoose");


const PORT = 2005;
const app = express();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/", my_Route);

//
app.listen(PORT, () => {
  console.log(`server is running on port:${PORT}`);
});
