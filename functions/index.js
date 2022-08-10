// Libraries
const functions = require("firebase-functions");
const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const _ = require("lodash")
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

// DB Connect 
mongoose.connect("mongodb+srv://admin-benjamin:BengeeL12@cluster0.fiodryj.mongodb.net/blogPostDB");

// Schemas
const postsSchema = {
  title: String,
  content: String
};

// Models
const Post = mongoose.model (
  "post", postsSchema
);

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
      Post.find({}, (err, foundPosts) => {
        if(err){
          console.log(err);
        } else {
          res.render("blog", {
            postsList: foundPosts,
            year: currentYear,
            pageName: "blog"
          })
        }  
      })
    });

// Compose article (Hidden route + ID)
app.route("/compose")
    .get((req,res) => {
          res.render("compose", {
          year: currentYear,
          pageName: "blog"
          })
        })
    .post((req,res) => {
      const post = new Post ({
        title: req.body.title,
        content: req.body.post
      })
      post.save((err) => {
        if (!err){
          res.redirect("/blog");
        };
    })
  });

///////// POST /////////
app.route("/blog/post/:postID")
  .get((req,res) => {
    const postID = req.params.postID;
    const post = Post.findOne({_id: postID}, function(err, postFound){
      if(!err){
        if (post !== undefined) {
          console.log("Match found!");
          
          res.render("post", {
            postTitle: postFound.title,
            postContent: postFound.content,
            year: currentYear,
            pageName: "blog"
          })
        }
      } 

      else {
          console.log("No match!")
          res.render("post", {
            postTitle: "NO MATCH ARTICLE FOUND",
            postContent: "Please go back to home page",
            year: currentYear,
            pageName: "blog"
          });
      };
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
