var express = require("express");
var sql = require("conn.js");
const session = require("express-session");
var rout = express.Router();

rout.get("/", function (req, res) {
  res.render("login_page/login.ejs");
});

rout.post("/save_login", async function (req, res) {
  try {
    var a = req.body;
    var data = await sql(
      `SELECT * FROM admin WHERE email='${a.email}' AND password='${a.password}'`
    );
    if (data.length == 1) {
      req.session.admin = data[0].name;
      // console.log(req.session.admin);
      res.redirect("/admin/");
    } else {
      res.send(
        "<script>alert('invalid Login');  location.href='/login'</script>"
      );
      // req.session.log_id = ;
    }
  } catch (error) {
    console.log(error);
    res.send(
      "<script>alert('invalid Login');  location.href='/login'</script>"
    );
  }
});

module.exports = rout;
