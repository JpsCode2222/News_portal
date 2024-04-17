var express = require("express");
var bodyparser = require("body-parser");
var uploads = require("express-fileupload");
var session = require("express-session");
var app = express();
var user = require("./router/user");
// var admin_login = require("./router/admin_login");
var admin = require("./router/admin");
var login = require("./router/login");

app.use(uploads());
app.use(express.static("public/"));
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "NEWS_a2z123",
    saveUninitialized: true,
    resave: true,
  })
);

app.use("/", user);
// app.use("/b_login",admin_login);
app.use("/admin", admin);
app.use("/login", login);

app.listen(5000);
