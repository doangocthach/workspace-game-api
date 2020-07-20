const mongoose = require("mongoose");

module.exports = mongoose.model(
  "workspace",
  {
    workspaceName: {
      type: String,
    },
    emailOwner: {
      type: String,
    },
  },
  "workspace"
);
