const express = require("express");
const WorkspaceModel = require("../models/workspace.model");
const uuid = require("uuid");
const route = express.Router();
const sendMail = require("../config/mailer");
const escapeRegex = require("../utils/regex-escape");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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
  const user = await WorkspaceModel.findOne({ email });
  if (user) {
    res.status(400).send("Failed! Email is already in use!");
  }
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
  let user = await WorkspaceModel.findOne({ token: req.params.token });
  if (!user) {
    res.redirect(`http://localhost:5000`);
  }
  res.redirect(`http://localhost:5000/login?email=${user.email}`);
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  try {
    let workspace = await WorkspaceModel.findOne({ email: email });
    if (!workspace) {
      throw "Not found user";
    } else if (!workspace.password) {
      await WorkspaceModel.findOneAndUpdate(
        { email: email },
        { password: hash }
      );
      res.status(200).send("Create user successfully");
    } else if (bcrypt.compareSync(password, workspace.password)) {
      await WorkspaceModel.findOneAndUpdate({ email: email }, { token: null });
      res.status(200).send("Login successfully");
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = route;
