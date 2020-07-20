require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const WorkspaceModel = require("./models/workspace.model");
const cors = require("cors");
const mongoose = require("mongoose");
const SECRET = process.env.JWT_SECRET;
mongoose.Promise = global.Promise;

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.log(e);
  }

  console.log("DB connected");

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.get("/", (req, res) => res.send("working..."));

  app.get("/list", async (req, res, next) => {
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
