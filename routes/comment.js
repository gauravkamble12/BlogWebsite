const express = require("express");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * CREATE COMMENT (NORMAL FORM)
 */
router.post("/comment/:id", auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  const comment = await Comment.create({
    text: req.body.text,
    user: req.session.userId,
    blog: req.params.id,
  });

  // 🔔 notify blog owner
  if (blog.author.toString() !== req.session.userId) {
    await Notification.create({
      user: blog.author,
      message: "Someone commented on your blog",
      link: "/",
    });
  }

  res.redirect(req.get("referer") || "/");
});

/**
 * CREATE COMMENT (AJAX – NO RELOAD)
 */
router.post("/comment/:id/ajax", auth, async (req, res) => {
  if (!req.body.text || req.body.text.trim() === "") {
    return res.status(400).json({ error: "Empty comment" });
  }

  const comment = await Comment.create({
    text: req.body.text,
    user: req.session.userId,
    blog: req.params.id,
    parent: req.body.parent || null,
  });

  const populated = await comment.populate("user");
  res.json(populated);
});


/**
 * DELETE OWN COMMENT
 */
router.post("/comment/:id/delete", auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment || comment.user.toString() !== req.session.userId) {
    return res.redirect(req.get("referer") || "/");
  }

  await Comment.findByIdAndDelete(req.params.id);
  res.redirect(req.get("referer") || "/");
});

module.exports = router;
