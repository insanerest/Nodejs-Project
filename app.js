const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/public", express.static("public"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
