const express = require("express");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Follow = require("../models/Follow");

const router = express.Router();

router.get("/profile/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  const blogs = await Blog.find({ author: user._id });
  const followers = await Follow.countDocuments({ following: user._id });

  res.render("profile", { profileUser: user, blogs, followers });
});

module.exports = router;
