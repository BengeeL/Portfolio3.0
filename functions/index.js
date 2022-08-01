// Libraries
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const cors = require("cors")({origin: true});
const ejs = require("ejs");
dotenv.config();

// Middleware. 
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(cors);

// Import hidden variables.
const CLIENT_EMAIL = process.env.EMAIL;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Google OAUTH for nodemailer.
const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET, 
    REDIRECT_URI
);

OAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Send email to email via nodemailer and google oauth. 
async function sendMail (name, sender, title, content) {
  try {
    const accessToken = await OAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: CLIENT_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      }
    });

    const mailOptions = {
      from: sender,
      to: CLIENT_EMAIL,
      subject: `Message from ${name}: ${title}`,
      text: `${content} \nFrom: ${sender}`,
      html: `<h1>${title}</h1>
                    <p>${content}</p>   
                    <p style="font-size:small;">From: ${sender}</p>`,
    };

    const result = await transport.sendMail(mailOptions);

    return "success";
  } catch (error) {
    return error;
  };
};

// App variables
const currentYear = new Date ().getFullYear();

//////////////////////  ------------  ROUTES  ------------  //////////////////////
///////// INDEX /////////
app.route("/")
    .get((req, res) => {
      res.render("index", {
        year: currentYear,
      });
    });

///////// HOME /////////
app.route("/home")
    .get((req, res) => {
      res.render("home", {
        year: currentYear,
        pageName: "home",
      });
    });

///////// RESUME /////////
app.route("/resume")
    .get((req, res) => {
      res.render("resume", {
        year: currentYear,
        pageName: "resume",
      });
    });

///////// PORTFOLIO /////////
app.route("/portfolio")
    .get((req, res) => {
      res.render("portfolio", {
        year: currentYear,
        pageName: "portfolio",
      });
    });

///////// BLOG /////////
app.route("/blog")
    .get((req, res) => {
      res.render("blog", {
        year: currentYear,
        pageName: "blog",
      });
    });

///////// CONTACT /////////
app.route("/contact")
    .get((req, res) => {
      res.render("contact", {
        year: currentYear,
        pageName: "contact",
      });
    })
    .post((req,res) => {
      const name = req.body.name;
      const email = req.body.email;
      const subject = req.body.subject;
      const message = req.body.message;

      sendMail(name, email, subject, message)
          .then(result => res.send(result))
          .catch(error => res.send(error));        
    });

// PORT LISTEN 
// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//     console.log(`server running on ${port}`)
// })

exports.app = functions.https.onRequest(app);
