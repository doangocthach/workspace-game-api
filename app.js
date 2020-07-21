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
const { error } = require("console");

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
      await sendMail(email, token, req.protocol, req.get("host")); // Send email
      await WorkspaceModel.create({
        name,
        email,
        token,
      });
      // const token = jwt.sign(email, SECRET);
      res.status(200).send("Create workspace successfully");
    } catch (error) {
      res.status(404).send("Something broke!");
    }
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
    res.redirect(`http://localhost:5000/login`);
  });

  app.post("/login", (req, res) => {});

  const server = http.createServer(app);
  server.listen(8080, () => {
    console.log("Working...");
  });
};

main();
