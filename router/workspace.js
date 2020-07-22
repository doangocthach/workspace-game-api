const express = require("express");
const WorkspaceModel = require("../models/workspace.model");
const uuid = require("uuid");
const route = express.Router();
const sendMail = require("../config/mailer");
const escapeRegex = require("../utils/regex-escape");

route.get("/list/:page", async (req, res, next) => {
  const pageSize = 3;
  const page = req.params.page > 0 ? req.params.page : 1;
  let listWorkspace, totalWorkspace;

  let searchName = {};
  if (req.query.search) {
    name = new RegExp(escapeRegex(req.query.search), "gi");
    searchName = {
      name: name,
    };
  }
  listWorkspace = await WorkspaceModel.find(searchName)
    .sort({ createdAt: -1 })
    .skip(pageSize * page - pageSize)
    .limit(pageSize);
  totalWorkspace = await WorkspaceModel.countDocuments(searchName);
  res.send({ listWorkspace, totalWorkspace });
});

route.get("/search/:query", async (req, res, next) => {
  const listWorkspace = await WorkspaceModel.find({}).lean();
  res.send(listWorkspace);
});

route.post("/create", async (req, res) => {
  const { name, email } = req.body;

  try {
    const token = uuid.v4();
    await WorkspaceModel.create({
      name,
      email,
      token,
    });
    await sendMail(email, token, req.protocol, req.get("host")); // Send email

    res.status(200).send("Create workspace successfully");
  } catch (error) {
    res.status(404).send("Something broke!");
  }
});

route.get("/verify/:token", async (req, res) => {
  let userToken = await WorkspaceModel.findOne({ token: req.params.token });
  if (!userToken) {
    res.status(404).send("Something broke!");
  }
  await WorkspaceModel.findOneAndUpdate(
    { _id: userToken._id },
    { isActive: true, token: null }
  );
  res.redirect(`http://localhost:5000/login`);
});

module.exports = route;
