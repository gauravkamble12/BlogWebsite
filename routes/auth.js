const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// SHOW REGISTER
router.get("/register", (req, res) => {
  res.render("auth/register");
});

// SHOW LOGIN
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, profession } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    profession,
  });

  res.redirect("/login");
});

// LOGIN
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.redirect("/login");

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.redirect("/login");

  req.session.userId = user._id;
  res.redirect("/");
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
