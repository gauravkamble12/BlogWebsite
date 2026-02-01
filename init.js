const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://Gauravkamble:0112@blogs.jcxrkww.mongodb.net/?appName=blogs")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
