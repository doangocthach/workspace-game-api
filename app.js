const express = require("express");
const jwt = require("jsonwebtoken");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const WorkspaceModel = require("./models/workspace.model");
const cors = require("cors");
const mongoose = require("mongoose");
const SECRET = "XP6j`?LXk}p>I3z";

mongoose.Promise = global.Promise;
mongoose.connect("db:27017/workspaceManagement", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const main = async () => {
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.get("/", (req, res) => res.send("working.."));

  app.get("/list", async (req, res, next) => {
    res.status(404).send("not fould");
    const listWorkspace = await WorkspaceModel.find({}).lean();
    res.send(listWorkspace);
  });
  app.post("/create", async (req, res, next) => {
    const { username } = req.body;
    const workspace = await WorkspaceModel.create({
      username,
    });
    const token = jwt.sign(workspace, SECRET);
    res.send(token);
  });
  // app.listen(process.env.PORT, () => {
  //   console.log("working...");
  // });
  const server = http.createServer(app);
  server.listen(8080, () => {
    console.log("Working...");
  });
};

main();
