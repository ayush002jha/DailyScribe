
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https");
const day = require(__dirname + "/date.js");
const defaultContent = require(__dirname + "/defaultContent.js");
require('dotenv').config()

 
const app = express();
app.set('view engine', 'ejs'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// Database Connection
mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.l3ynyob.mongodb.net/scribeDB?retryWrites=true&w=majority`);
// Schema:
const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
});
// Model -- Collection Name
const Post = mongoose.model("Post", postSchema);


app.get("/", async (req, res) => {
  const isEmpty = await Post.countDocuments({});
  if (isEmpty===0){
    await Post.insertMany(defaultContent.defaultContent);
  }
  const data = await Post.find({});
  // console.log(data)
  res.render('home', { allPost: data });
});
app.get("/about", (req, res) => {
  res.render('about');
});

app.get("/compose", (req, res) => {
  res.render('compose', { DAY: day.Day });
});

app.get("/newsletter", (req, res) => {
  res.render('newsletter', { DAY: day.Day });
});


app.get("/posts/:post", async (req, res) => {
  const requestID = req.params.post;
  const singlePost = await Post.findOne({ _id: requestID });
  res.render("post", { postTitle: singlePost.title, postContent: singlePost.post, postDate: singlePost.date });
})

app.post("/compose", (req, res) => {
  // Create a post
  const post = new Post({
    title: req.body.title,
    post: req.body.post,
    date: req.body.date
  })
  // Query
  post.save();
  // allPost.push(post);
  res.redirect("/");
});

app.post("/newsletter", (req, res) => {
  var firstName = req.body.fName;
  var lastName = req.body.lName;
  var email = req.body.email;
  var data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }

      }
    ],
  }

  const postData = JSON.stringify(data);

  const url = process.env.URL;

  const options = {
    method: "POST",
    // To provide authentication
    auth: `ayush1:${process.env.API_KEY}`
  }
  // Here we create an HTTPS POST Request
  const request = https.request(url, options, (response) => {
    console.log(response.statusCode);
    if (response.statusCode === 200) {
      res.render("success");
    } else {
      res.render("failure");
    }
  })
  // Here we use write method on request to send the data
  request.write(postData);
  request.end();
})
 

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
