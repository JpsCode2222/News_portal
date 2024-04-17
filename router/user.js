var express = require("express");
var sql = require("./conn");
const session = require("express-session");
var rout = express.Router();

// function to check admin login or not
function chack_login(req, res, next) {
  if (req.session.admin != undefined) {
    next();
  } else {
    res.redirect("/login");
  }
}

rout.get("/", async function (req, res) {
  // Trending news
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending' AND status='Approved' ORDER BY id DESC`
  );
  // Recent news
  const r_news = await sql(
    `SELECT * FROM all_news WHERE status='Approved' ORDER BY id DESC`
  );
  // Finance news
  const f_news = await sql(
    `SELECT * FROM all_news WHERE category='Finance'  AND status='Approved'  ORDER BY id DESC`
  );
  // Technology news
  const tech_news = await sql(
    `SELECT * FROM all_news WHERE category='Technology'  ORDER BY id DESC`
  );
  // Sport news
  const s_news = await sql(
    `SELECT * FROM all_news WHERE category='Sports'  AND status='Approved'  ORDER BY id DESC`
  );
  // Tour news
  const tour_news = await sql(
    `SELECT * FROM all_news WHERE category='Travel&Turism'  AND status='Approved'  ORDER BY id DESC`
  );
  res.render("user/index.ejs", {
    t_news,
    f_news,
    tech_news,
    s_news,
    r_news,
    tour_news,
  });
});

rout.get("/Trending", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE status='Approved'  ORDER BY id DESC`
    // `SELECT * FROM all_news WHERE category='Trending'  ORDER BY id DESC`
  );
  res.render("user/trending_news.ejs", { t_news });
});

rout.get("/Entertainment", async function (req, res) {
  const e_news = await sql(
    `SELECT * FROM all_news WHERE status='Approved'  ORDER BY id DESC`
    // `SELECT * FROM all_news WHERE category='Trending'  ORDER BY id DESC`
  );
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved' ORDER BY id DESC`
  );
  //
  res.render("user/entertainment_news.ejs", { e_news, t_news });
});

rout.get("/agri_government", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved'  ORDER BY id DESC`
  );
  const e_news = await sql(
    `SELECT * FROM all_news WHERE status='Approved' ORDER BY id DESC`
  );
  res.render("user/agri_news.ejs", { t_news, e_news });
});

rout.get("/Sports", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved'  ORDER BY id DESC`
  );
  const e_news = await sql(
    `SELECT * FROM all_news WHERE status='Approved' ORDER BY id DESC`
  );
  res.render("user/sports_news.ejs", { t_news, e_news });
});

rout.get("/LifeStyle", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved'  ORDER BY id DESC`
  );
  const e_news = await sql(
    `SELECT * FROM all_news WHERE status='Approved' ORDER BY id DESC`
  );
  res.render("user/lifeStyle_news.ejs", { t_news, e_news });
});

rout.get("/About", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved' ORDER BY id DESC`
  );
  var missions = await sql(`SELECT * FROM our_mission`);
  var visions = await sql(`SELECT * FROM our_vision`);
  var services = await sql(`SELECT * FROM services`);
  var teammembers = await sql(`   SELECT * FROM team_member`);
  res.render("user/about.ejs", {
    missions: missions,
    visions: visions,
    services: services,
    teammembers: teammembers,
  });
});

rout.get("/Category", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending' AND status='Approved'  ORDER BY id DESC`
  );
  res.render("user/categori.ejs", { t_news });
});

rout.get("/latest_news/:id", async function (req, res) {
  const news = await sql(`SELECT * FROM all_news WHERE id='${req.params.id}'`);
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved'  ORDER BY id DESC`
  );
  res.render("user/latest_news.ejs", { news: news[0], t_news });
});

// rout.get("/Blog",function(req,res){
//     res.render("user/blog.ejs")
// });

// rout.get("/Blog Details",function(req,res){
//     res.render("user/blog_details.ejs")
// });

// rout.get("/Element",function(req,res){
//     res.render("user/elements/ejs")
// });

rout.get("/Contact", async function (req, res) {
  const t_news = await sql(
    `SELECT * FROM all_news WHERE category='Trending'  AND status='Approved'  ORDER BY id DESC`
  );
  res.render("user/contact.ejs", { t_news });
});

rout.post("/save_contact", async function (req, res) {
  var d = new Date().getDate();
  d = d < 10 ? "0" + d : d;
  var m = new Date().getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  var y = new Date().getFullYear();
  var time1 = new Date().getHours();
  var time2 = new Date().getMinutes();
  var ctime = time1 + ":" + time2;
  var today = d + "/" + m + "/" + y;
  var a = req.body;
  await sql(`INSERT INTO contact_form (name,email,subject,message,date,time) VALUES
  ('${a.name}','${a.email}','${a.subject}','${a.message}','${today}','${ctime}')`);
  // res.send(req.body);
  // res.send(data);
  res.redirect("/Contact");
});

// check user login or not
function check_login(req, res, next) {
  if (req.session.admin != undefined) {
    next();
  } else {
    res.redirect("/user_login");
  }
}

// user_dashboard routes
// single user page (to add new news)
rout.get("/user", check_login, async function (req, res) {
  res.render("user_page/user_dashboard.ejs");
});

// login page
rout.get("/user_login", async function (req, res) {
  res.render("login_page/user_login.ejs");
});

rout.get("/logout", check_login, async function (req, res) {
  req.session.destroy();
  res.redirect("/user_login");
});

rout.get("/user_dashboard", check_login, async function (req, res) {
  res.render("user_page/user_dashboard.ejs");
});

rout.get("/user_all_news", check_login, async function (req, res) {
  const news = await sql(
    `SELECT * from all_news WHERE reporter='${req.session.admin}' ORDER BY id DESC`
  );
  res.render("user_page/all_news.ejs", { news });
});

// Pending News
rout.get("/user_pending_news", check_login, async function (req, res) {
  const news = await sql(
    `SELECT * from all_news WHERE status = 'Pending' AND reporter='${req.session.admin}'`
  );
  res.render("user_page/user_pending_news.ejs", { news });
});

// Rejected News
rout.get("/user_rejected_news", check_login, async function (req, res) {
  const news = await sql(
    `SELECT * from all_news WHERE status = 'Rejected'  AND reporter='${req.session.admin}'`
  );
  res.render("user_page/user_rejected_news.ejs", { news });
});

module.exports = rout;
