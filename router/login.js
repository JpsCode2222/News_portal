var express = require("express");
var sql = require("./conn.js");
const session = require("express-session");
var rout = express.Router();

rout.get("/", function (req, res) {
  res.render("login_page/login.ejs");
});

rout.get("/user_login", async function (req, res) {
  res.render("login_page/user_login.ejs");
});
rout.post("/save_login", async function (req, res) {
  try {
    var a = req.body;
    var data = await sql(
      `SELECT * FROM admin WHERE email='${a.email}' AND password='${a.password}'`
    );
    if (a.admin === "admin") {
      req.session.admin = data[0].name;
      res.redirect("/admin/");
    } else if (a.admin === "user") {
      req.session.admin = data[0].name;
      res.redirect("/user_dashboard/");
    } else {
      res.send(
        "<script>alert('invalid Login');  location.href='/login'</script>"
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      "<script>alert('invalid Login');  location.href='/login'</script>"
    );
  }
});

module.exports = rout;
