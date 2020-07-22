const express = require("express");
const WorkspaceModel = require("../models/workspace.model");
const route = express.Router();

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await WorkspaceModel.findOne({ email: email });
  if (!user) {
    res.status(404).send("Not found");
  }
});

module.exports = route;
