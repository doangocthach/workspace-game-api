require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const WorkspaceModel = require("./models/workspace.model");
const sendMail = require("./config/mailer");
const cors = require("cors");
const mongoose = require("mongoose");
const SECRET = process.env.JWT_SECRET;
const uuid = require("uuid");

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
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
  app.post("/create", async (req, res) => {
    const { name, email } = req.body;

    try {
      const token = uuid.v4();
      sendMail(email, token, req.protocol, req.get("host")); // Send email
      await WorkspaceModel.create({
        name,
        email,
        token,
      });
    } catch (error) {
      res.status(404).send("Something broke!");
    }

    const token = jwt.sign(email, SECRET);
    res.send(token);
  });

  app.get("/verify/:token", async (req, res) => {
    let userToken = await WorkspaceModel.findOne({ token: req.params.token });
    if (!userToken) {
      res.status(404).send("Something broke!");
    }
    await WorkspaceModel.findOneAndUpdate(
      { _id: userToken._id },
      { isActive: true, token: null }
    );
    res.send(userToken);
  });

  const server = http.createServer(app);
  server.listen(8080, () => {
    console.log("Working...");
  });
};

main();
