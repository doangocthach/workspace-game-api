require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const workspace = require("./router/workspace");

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

  app.use("/api", router);

  const server = http.createServer(app);
  server.listen(8080, () => {
    console.log("Working...");
  });
};

main();
