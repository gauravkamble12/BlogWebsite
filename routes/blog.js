const express = require("express");
const router = express.Router();
const multer = require("multer");
const Blog = require("../models/Blog");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");



const upload = multer({ dest: "public/uploads/" });

/**
 * HOME – SHOW ALL BLOGS (PUBLIC)
 */
router.get("/", async (req, res) => {
  const blogs = await Blog.find().populate("author");

  const blogsWithExtras = await Promise.all(
    blogs.map(async blog => {
      const likesCount = await Like.countDocuments({ blog: blog._id });

      const comments = await Comment.find({ blog: blog._id })
        .populate("user")
        .sort({ createdAt: -1 });
        const commentMap = {};
        comments.forEach(c => {
        c = c.toObject();
        c.replies = [];
        commentMap[c._id] = c;
        });
        const rootComments = [];
        comments.forEach(c => {
        if (c.parent) {
            commentMap[c.parent]?.replies.push(commentMap[c._id]);
        } else {
            rootComments.push(commentMap[c._id]);
        }});
      return {
        ...blog.toObject(),
        likesCount,
        commentsCount: comments.length,
        comments, // 👈 THIS MAKES COMMENTS VISIBLE TO ALL
      };
    })
  );

  // optional UX improvement
  if (blogsWithExtras.length === 0 && req.session?.userId) {
    return res.redirect("/blogs/new");
  }

  res.render("index", { blogs: blogsWithExtras });
});

/**
 * SHOW CREATE BLOG PAGE
 */
router.get("/blogs/new", auth, (req, res) => {
  res.render("blogs/create");
});

/**
 * CREATE BLOG
 */
router.post(
  "/blogs",
  upload.array("images", 5),
  async (req, res) => {
    const images = req.files.map(file => file.filename);

    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      images,
      author: req.session.userId
    });

    await blog.save();
    res.redirect("/");
  }
);


/**
 * SHOW EDIT PAGE
 */
router.get("/blogs/:id/edit", auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog || blog.author.toString() !== req.session.userId) {
    return res.redirect("/");
  }

  res.render("blogs/edit", { blog });
});

/**
 * UPDATE BLOG
 */
router.post("/blogs/:id/update", auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog || blog.author.toString() !== req.session.userId) {
    return res.redirect("/");
  }

  await Blog.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
  });

  res.redirect("/");
});

/**
 * DELETE BLOG
 */
router.post("/blogs/:id/delete", auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog || blog.author.toString() !== req.session.userId) {
    return res.redirect("/");
  }

  await Blog.findByIdAndDelete(req.params.id);
  res.redirect("/");
});
// SHOW SINGLE BLOG (PUBLIC)
router.get("/blogs/:id", async (req, res) => {
  const Blog = require("../models/Blog");
  const Like = require("../models/Like");
  const Comment = require("../models/Comment");

  const blog = await Blog.findById(req.params.id).populate("author");

  if (!blog) {
    return res.redirect("/");
  }

  const likesCount = await Like.countDocuments({ blog: blog._id });
  const comments = await Comment.find({ blog: blog._id }).populate("user");

  res.render("blogs/show", {
    blog: {
      ...blog.toObject(),
      likesCount,
      commentsCount: comments.length,
      comments,
    },
  });
});

module.exports = router;
