const express = require("express");
const path = require("path");
const session = require("express-session");
const User = require("./models/User");
const Notification = require("./models/Notification");

const app = express();

// ==================
// DATABASE CONNECTION
// ==================
require("./init");

// ==================
// BODY PARSERS
// ==================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==================
// STATIC FILES
// ==================

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ==================
// SESSION CONFIG
// ==================
app.use(
  session({
    secret: "blogsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// ==================
// GLOBAL VARIABLES FOR EJS
// ==================
app.use(async (req, res, next) => {
  try {
    if (req.session?.userId) {
      res.locals.user = await User.findById(req.session.userId);
      res.locals.notifications = await Notification.find({
        user: req.session.userId,
        isRead: false,
      }).limit(5);
    } else {
      res.locals.user = null;
      res.locals.notifications = [];
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ==================
// VIEW ENGINE
// ==================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==================
// ROUTES
// ==================
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/blog"));
app.use("/", require("./routes/follow"));
app.use("/", require("./routes/profile"));
app.use("/", require("./routes/like"));
app.use("/", require("./routes/comment"));

// ==================
// SERVER
// ==================
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
