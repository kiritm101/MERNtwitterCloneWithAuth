//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const app = express();
console.log(process.env.API_KEY);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });
const User = new mongoose.model("User", userSchema);
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password),
  });
  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function (req, res) {
  username = req.body.username;
  password = md5(req.body.password);
  User.findOne({ email: username }, function (err, founduser) {
    if (founduser.password == password) {
      res.render("secrets");
    } else {
      res.send("incorrect username or password");
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on Port 3000");
});
