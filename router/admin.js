var express = require("express");
var sql = require("./conn.js");
var fs = require("fs");
var rout = express.Router();
const session = require("express-session");

// function to check admin login or not
function check_login(req, res, next) {
  if (req.session.admin != undefined) {
    next();
  } else {
    res.redirect("/login");
  }
}

rout.get("/", check_login, async function (req, res) {
  res.render("admin/home.ejs");
});

rout.get("/about", check_login, async function (req, res) {
  var missions = await sql(`SELECT * FROM our_mission`);
  var visions = await sql(`SELECT * FROM our_vision`);
  var services = await sql(`SELECT * FROM services`);
  var teammembers = await sql(`   SELECT * FROM team_member`);
  res.render("admin/about.ejs", {
    missions: missions,
    visions: visions,
    services: services,
    teammembers: teammembers,
  });
});

rout.post("/update_mission", check_login, async function (req, res) {
  var d = req.body;
  await sql(
    `UPDATE our_mission SET title='${d.title}',details1='${d.details1}',details2='${d.details2}'WHERE id = '1'`
  );
  res.redirect("/admin/about");
});
rout.post("/update_vision", check_login, async function (req, res) {
  var d = req.body;
  await sql(
    `UPDATE our_vision SET title='${d.title}',detail='${d.detail}',detail2='${d.detail2}'WHERE id='1'`
  );
  res.redirect("/admin/about");
});
rout.post("/update_services", check_login, async function (req, res) {
  var d = req.body;
  if (req.files != undefined) {
    if (req.files.image) {
      var image = new Date().getTime() + req.files.image.name;
      req.files.image.mv("public/uploads/" + image);
      var data = await sql(
        `UPDATE services SET image='${image}',title='${d.title}',name='${d.name}',details1='${d.details1}',details2='${d.details2}',button_link='${d.button_link}' WHERE id = '1'`
      );
      var data1 = await sql(`SELECT image FROM services WHERE id='${1}'`);
      var imagePath = "public/uploads/" + data1[0].image; // Path to the image file you want to remove
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Image file has been removed successfully");
      });
      console.log(image);
    }
  } else {
    await sql(
      `UPDATE services SET title='${d.title}',name='${d.name}',details1='${d.details1}',
            details2='${d.details2}',button_link='${d.button_link}' WHERE id = '1'`
    );
    res.redirect("/admin/about");
  }
});

rout.post("/save_team_member", check_login, async function (req, res) {
  var d = req.body;
  if (req.files) {
    let member_image = new Date().getTime() + req.files.member_image.name;
    await req.files.member_image.mv("public/uploads/" + member_image);
    await sql(
      `INSERT INTO team_member (member_image,member_name,member_position) VALUES ('${member_image}','${d.member_name}','${d.member_position}')`
    );
  }
  res.redirect("admin/about");
});
rout.get("/edit_team_member/:id", check_login, async function (req, res) {
  var team_info = await sql(
    `SELECT * FROM team_member WHERE id = '${req.params.id}'`
  );
  res.render("admin/edit_team_member.ejs", { team_info: team_info });
});

rout.get("/delete_team_member/:id", check_login, async function (req, res) {
  var data = `DELETE FROM team_member WHERE id = '${req.params.id}'`;
  await sql(data);
  res.redirect("/admin/about");
});

rout.post("/update_ad_image", check_login, async function (req, res) {
  res.redirect("/admin/about");
});

// function to get Date and time;

function getDate() {
  var date = new Date();
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function getTime() {
  // Create a new Date object
  var date = new Date();

  // Get the hours, minutes, and seconds
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();

  // Check if the hours are greater than 12
  if (hours > 12) {
    // Convert the hours to 12-hour format
    hours -= 12;
    // Add AM or PM to the hours
    if (hours === 0) {
      hours = 12;
    }
    seconds += " AM";
  } else {
    // Add AM or PM to the hours
    seconds += " PM";
  }

  minutes < 10 ? (minutes = "0" + minutes) : minutes;
  seconds < 10 ? (seconds = "0" + seconds) : seconds;

  // Display the time in the customized format
  return hours + ":" + minutes + ":" + seconds;
}
// function to remove white spaces
function removeWhiteSpace(str) {
  return str.replace(/\s/g, "");
}

// Post new news
rout.get("/add_news", check_login, async function (req, res) {
  res.render("admin/add_news.ejs");
});

// function to remove tags and ' quotes
function removeTagsAndQuote(str) {
  const regex = `/(<[^>]*>)|(')|(")|(|)/g`;
  return str.replace(regex, "");
}

// Example usage:
const str = 'This is a string with <tags> and "quotes".';
const result = removeTagsAndQuote(str);

rout.post("/save_news", check_login, async function (req, res) {
  if (req.session.admin) {
    if (req.files) {
      var d = req.body;
      var date = getDate();
      var time = getTime();
      var heading = removeTagsAndQuote(d.heading);
      var details = removeTagsAndQuote(d.details);
      var category = removeTagsAndQuote(d.category);
      var status = removeTagsAndQuote(d.status);
      var reporter = req.session.admin;
      var social_link = removeTagsAndQuote(d.social_link);
      const img_video_name =
        new Date().getTime() + removeWhiteSpace(req.files.img_video.name);
      await req.files.img_video.mv("public/uploads/" + img_video_name);
      await sql(
        `INSERT INTO all_news (img_video,heading,details,category,date,time,status,reporter,social_link) VALUES ('${img_video_name}','${heading}','${details}','${category}','${date}','${time}','${status}','${reporter}','${social_link}')`
      );
    }
    if (status === "Pending") {
      res.redirect("/user_dashboard");
    } else {
      res.redirect("/admin/add_news");
    }
    return;
  } else {
    if (req.files) {
      var d = req.body;
      var date = getDate();
      var time = getTime();
      var heading = removeTagsAndQuote(d.heading);
      var details = removeTagsAndQuote(d.details);
      var category = removeTagsAndQuote(d.category);
      var status = removeTagsAndQuote(d.status);
      var reporter = removeTagsAndQuote(d.reporter);
      var social_link = removeTagsAndQuote(d.social_link);
      const img_video_name =
        new Date().getTime() + removeWhiteSpace(req.files.img_video.name);
      await req.files.img_video.mv("public/uploads/" + img_video_name);
      await sql(
        `INSERT INTO all_news (img_video,heading,details,category,date,time,status,reporter,social_link) VALUES ('${img_video_name}','${heading}','${details}','${category}','${date}','${time}','${status}','${reporter}','${social_link}')`
      );
    }

    if (status === "Pending") {
      res.redirect("/user_dashboard");
    } else {
      res.redirect("/admin/add_news");
    }
    return;
  }
});

rout.get("/all_news", check_login, async function (req, res) {
  const news = await sql(
    `SELECT * from all_news WHERE status='Approved' ORDER BY id DESC`
  );
  res.render("admin/all_news.ejs", { news });
});

rout.get("/edit_news/:id", check_login, async function (req, res) {
  const news = await sql(
    `SELECT * from all_news WHERE id = '${req.params.id}'`
  );
  res.render("admin/edit_news.ejs", { news: news[0] });
});

rout.post("/update_news", check_login, async function (req, res) {
  var d = req.body;
  if (req.files) {
    const img_video_name =
      new Date().getTime() + removeWhiteSpace(req.files.img_video.name);
    await req.files.img_video.mv("public/uploads/" + img_video_name);
    await sql(
      `UPDATE all_news SET img_video='${img_video_name}',heading='${d.heading}',details='${d.details}',category='${d.category}',date='${d.date}',time='${d.time}',status='${d.status}',reporter='${d.reporter}',social_link='${d.social_link}' WHERE id='${d.id}'`
    );
  } else {
    await sql(
      `UPDATE all_news SET heading='${d.heading}',details='${d.details}',category='${d.category}',date='${d.date}',time='${d.time}',status='${d.status}',reporter='${d.reporter}',social_link='${d.social_link}' WHERE id='${d.id}'`
    );
  }
  res.redirect("/admin/all_news");
});

rout.get("/delete_news/:id", async (req, res) => {
  const data = await sql(
    `SELECT * from all_news WHERE id = '${req.params.id}'`
  );
  var img_video = "public/uploads/" + data[0].img_video; // Path to the image file you want to remove
  fs.unlink(img_video, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Image file has been removed successfully");
  });
  const news = await sql(`DELETE FROM all_news WHERE id = '${req.params.id}'`);
  res.redirect("/admin/all_news");
});

// Pending News
rout.get("/pending_news", check_login, async function (req, res) {
  const news = await sql(`SELECT * from all_news WHERE status = 'Pending'`);
  res.render("admin/pending_news.ejs", { news });
});

// Rejected News
rout.get("/rejected_news", check_login, async function (req, res) {
  const news = await sql(`SELECT * from all_news WHERE status = 'Rejected'`);
  res.render("admin/rejected_news.ejs", { news });
});

// Approved News
rout.get("/approve_news/:id", async (req, res) => {
  const data = await sql(
    `UPDATE all_news SET status='Approved' WHERE id = '${req.params.id}'`
  );
  res.redirect("/admin/pending_news");
});

// Pending News
rout.get("/reject_news/:id", async (req, res) => {
  const data = await sql(
    `UPDATE all_news SET status='Rejected' WHERE id = '${req.params.id}'`
  );
  res.redirect("/admin/reject_news");
});

module.exports = rout;

// CREATE TABLE advertise_img(id INT PRIMARY KEY AUTO_INCREMENT,ad_image TEXT)
// CREATE TABLE team_member(id INT PRIMARY KEY AUTO_INCREMENT,member_image TEXT,member_name VARCHAR(200),member_position VARCHAR(200))
// CREATE TABLE our_mission(id INT PRIMARY KEY AUTO_INCREMENT,title VARCHAR(200),details1 TEXT,details2 TEXT);
// CREATE TABLE our_vision(id INT PRIMARY KEY AUTO_INCREMENT,title VARCHAR(200),detail TEXT,detail2 TEXT);
// CREATE TABLE services(id INT PRIMARY KEY AUTO_INCREMENT,image TEXT,title VARCHAR(200),name VARCHAR(200),details1 TEXT,details2 TEXT,button_link TEXT);

// News Table
// CREATE TABLE all_news(id INT PRIMARY KEY AUTO_INCREMENT,img_video TEXT,heading TEXT,details TEXT,category VARCHAR(50),date VARCHAR(20),time VARCHAR(50),status VARCHAR(50),reporter VARCHAR(200),social_link TEXT)
