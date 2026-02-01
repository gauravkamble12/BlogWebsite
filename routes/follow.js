const express = require("express");
const Follow = require("../models/Follow");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/follow/:id", auth, async (req, res) => {
  const exists = await Follow.findOne({
    follower: req.session.userId,
    following: req.params.id,
  });

  if (!exists) {
    await Follow.create({
      follower: req.session.userId,
      following: req.params.id,
    });
  }

  res.redirect("back");
});

router.post("/unfollow/:id", auth, async (req, res) => {
  await Follow.findOneAndDelete({
    follower: req.session.userId,
    following: req.params.id,
  });

  res.redirect("back");
});

module.exports = router;
