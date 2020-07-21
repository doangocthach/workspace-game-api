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
    isActive: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
  },
  "workspace"
);
