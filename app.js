require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const WorkspaceModel = require("./models/workspace.model");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const SECRET = process.env.JWT_SECRET;
// mongoose.Promise = global.Promise;

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
    const { name, email } = req.body;
    await WorkspaceModel.create({
      name,
      email,
    });
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "thachdn.nde18048@vtc.edu.vn", // generated ethereal user
        pass: "01213309289A", // generated ethereal password
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
    const token = jwt.sign(email, SECRET);
    console.log("Message sent: %s", info.messageId);
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
