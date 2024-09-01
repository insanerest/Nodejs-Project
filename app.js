const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const client = require("./db");
var { LocalStorage } = require("node-localstorage"),
  localStorage = new LocalStorage("./storage");
const bodyParser = require("body-parser");
const checkRole = require("./safety");
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

// Routes

// Self
app.get("/", function (req, res) {
  res.redirect("/api/login");
});
app.get("/api/login", function (req, res, next) {
  const user_last = localStorage.getItem("user_last");
  var sql = "SELECT * FROM users WHERE user_name = $1";
  var values = [user_last];
  client.query(sql, values, function (err, result) {
    if (err) throw err;
    if (result.rows.length > 0) {
      pass = result.rows[0].user_token1;
      localStorage.setItem("pass", pass);
    } else {
      res.render("login.ejs", { invalid: "Could not login" });
    }
  });
  let pass = localStorage.getItem("pass");
  localStorage.removeItem("pass");
  var sql = "SELECT * FROM users WHERE user_name = $1 AND user_token1 = $2";
  var values = [user_last, pass];
  client.query(sql, values, function (err, result) {
    if (err) throw err;
    if (result.rows.length > 0) {
      res.redirect("/dashboard");
    } else {
      res.render("login.ejs", { invalid: "Could not login" });
    }
  });
});
// Login

app.post("/api/login", (req, res) => {
  localStorage.setItem("user_last", "");
  const isUser = localStorage.length;
  var condition = isUser > 1;
  if (!condition) {
    const { username } = req.body;
    const { token1 } = req.body;
    var values = [username, token1];
    console.log(
      `SELECT * FROM users WHERE user_name = ${username} AND user_token1 = ${token1}`
    );
    client.query(
      "SELECT * FROM users WHERE user_name = $1 AND user_token1 = $2",
      [req.body.username, req.body.user_token1],
      function (err, result) {
        if (err) throw err;
        if ((username && token1 != "") || token1 != "" || username != "") {
          if (result.rows.length > 0) {
            res.redirect("/dashboard");
            localStorage.removeItem("user_last");
            localStorage.setItem("user_last", username);
          } else {
            res.render("login.ejs", {
              invalid: "Invalid username or password",
            });
          }
        } else {
          res.redirect("/api/login");
        }
      }
    );
    sql = "UPDATE users SET user_logged=$1, user_hash=$2 WHERE user_name=$3";
    values = ["true", token1, username];
    client.query(sql, values, function (err, result) {
      if (err) throw err;
    });
  }
  // else {
  //   const user_last = localStorage.getItem("user_last");
  //   var sql = "SELECT * FROM users WHERE user_name = $1";
  //   var values = [user_last];
  //   client.query(sql, values, function (err, result) {
  //     if (err) throw err;
  //     pass = result.rows[0].user_token1;
  //     localStorage.setItem("pass", pass);
  //   });
  //   let pass = localStorage.getItem("pass");
  //   localStorage.removeItem("pass");
  //   var sql = "SELECT * FROM users WHERE user_name = $1 AND user_token1 = $2";
  //   var values = [user_last, pass];
  //   client.query(sql, values, function (err, result) {
  //     if (err) throw err;
  //     if (result.rows.length > 0) {
  //       res.redirect("/dashboard");
  //     } else {
  //       res.render("login.ejs", { invalid: "Could not login" });
  //     }
  //   });
  // }
});

// Add user
app.put("/api/adduser", checkRole(), (req, res) => {
  var token1 = "";
  var token2 = "";
  for (var i = 0; i < 10; i++) {
    token1 += Math.floor(Math.random() * 10);
    token2 += Math.floor(Math.random() * 10);
  }
  const { user_name } = req.body;
  var sql =
    "INSERT INTO users (user_name, user_token1, user_token2) VALUES ($1, $2, $3)";
  var values = [user_name, token1, token2];
  client.query(sql, values, function (err, result) {
    if (err) throw err;
    res.json("User Added");
  });
});
// Delete user
app.delete("/api/deleteuser", checkRole(), (req, res) => {
  const { user_name } = req.body;
  var sql = "DELETE FROM users WHERE user_name = $1";
  var values = [user_name];
  client.query(sql, values, function (err, result) {
    if (err) throw err;
    res.json("User Deleted");
  });
});

// Get all users
app.get("/api/getusers", checkRole(), (req, res) => {
  var sql = "SELECT * FROM users";
  client.query(sql, function (err, result) {
    if (err) throw err;
    res.json(result.rows);
  });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
