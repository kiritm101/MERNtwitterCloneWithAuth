//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const app = express();
console.log(process.env.API_KEY);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.s5v2m.mongodb.net/userDB?retryWrites=true&w=majority"
);
// mongoose.set("useCreateIndex", true);
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: [],
});
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
// app.get("/secrets", function (req, res) {
//   if (req.isAuthenticated()) {
//     res.render("secrets");
//   } else {
//     res.render("login");
//   }
// });
app.get("/secrets", function (req, res) {
  User.find({ secret: { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        if (req.isAuthenticated()) {
          // res.render("secrets");
          res.render("secrets", { usersWithSecrets: foundUsers });
        } else {
          res.render("login");
        }
      }
    }
  });
});
app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.render("login");
  }
});
app.post("/submit", function (req, res) {
  const submittedSecret = req.body.secret;
  console.log(req.user.id); //logged in user document id
  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret.push(submittedSecret);
        foundUser.save(function () {
          console.log("SUbmitted successfully");
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});
app.listen(3000, function () {
  console.log("Server started on Port 3000");
});
