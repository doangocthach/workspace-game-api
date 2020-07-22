require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const workspace = require("./router/workspace");
const user = require("./router/user");

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

  const router = express.Router();
  app.get("/", (req, res) => res.send("working..."));

  router.use("/workspace", workspace);
  router.use("/user", user);

  app.use("/api", router);



  app.use((err, req, res, next) => {
    if (typeof err === "string") {
      // custom application error
      return res.status(400).json({ message: err });
    }

    if (err.name === "ValidationError") {
      // mongoose validation error
      return res.status(400).json({ message: err.message });
    }

    if (err.name === "UnauthorizedError") {
      // jwt authentication error
      return res.status(401).json({ message: "Invalid Token" });
    }

    // default to 500 server error
    return res.status(500).json({ message: err.message });
  });
  
  const server = http.createServer(app);
  server.listen(8080, () => {
    console.log("Working...");
  });
};

main();
