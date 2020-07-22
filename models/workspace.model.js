const mongoose = require("mongoose");

module.exports = mongoose.model(
  "workspace",
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    token: {
      type: String,
      default: null,
    },
    password: {
      type: String,
    },
    createdAt: {
      type: Number,
      default: Date.now(),
    },
  },
  "workspace"
);
