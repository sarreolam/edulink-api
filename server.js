
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


var cors = require('cors');
app.use(cors());
app.use('/',(req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})

// const cos = [
//     {
//       id :0,
//       name: "Mathematics",
//       text: `Mathematics is the study of numbers, quantities, and shapes. It provides a foundation for solving a wide range of real-world problems and is crucial in fields like science, engineering, and finance.`,
//       ready: 1,
//     },
//     {
//       id :1,
//       name: "History",
//       text: `History is the record of past events and the study of human societies, cultures, and their evolution over time. It helps us understand the present by examining the past.`,
//       ready: 0,
//     },
//     {
//       id :2,
//       name: "Engineering",
//       text: `Engineering is the application of scientific and mathematical principles to design, create, and improve technologies and systems, ranging from bridges to computer software.`,
//       ready: 0,
//     },
//     {
//       id :3,
//       name: "Arts",
//       text: `The arts encompass a wide range of creative expressions, including visual arts, performing arts, literature, and music. They reflect human creativity and culture.`,
//       ready: 0,
//     },
//     {
//       id :4,
//       name: "Languages",
//       text: `Languages are systems of communication used by humans. They play a vital role in cultural identity and allow people to connect and share ideas.`,
//       ready: 0,
//     },
//     {
//       id :5,
//       name: "Finances",
//       text: `Finances involve managing money and resources. This includes budgeting, investing, saving, and making financial decisions to achieve personal and economic goals.`,
//       ready: 0,
//     },
//     {
//       id :6,
//       name: "Buisness",
//       text: `Business encompasses the activities of buying, selling, and producing goods and services. It involves entrepreneurship, management, marketing, and various aspects of commerce.`,
//       ready: 0,
//     },
//     {
//       id :7,
//       name: "Science",
//       text: `Science is the systematic study of the natural world and the processes that govern it. It seeks to understand the fundamental laws and principles governing our universe.`,
//       ready: 0,
//     },
//   ]


const user = process.env.DB_USER
const pass = process.env.DB_PASS

const mongoUrl = `mongodb+srv://${user}:${pass}@cluster0.ihmzthb.mongodb.net/f1?retryWrites=true&w=majority`;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const courseSchema = new mongoose.Schema({
  id: Number,
  name: String,
  text: String,
  ready: Number,
});
courseSchema.set("strictQuery", true);
const Course = mongoose.model("Courses", courseSchema);

const userSchema = new mongoose.Schema(
  {
    name: String, 
    password: String,
    email: String,
    math_quiz:{
      type: Number || null,
      default: null
    } 
  }
);
userSchema.set("strictQuery", true);
const User = mongoose.model("Users", userSchema);



app.get("/api/courses", async (req, res) => {
  await Course.find({}).then((data)=>{
    res.send({data:data})
  }).catch((err)=>{
    // console.log(err)
    console.error(err);
  })
});

app.post("/api/log-in", async (req, res)=>{
  const user = await User.findOne({name: req.body.user })
  if (!user){
    res.status(200).send({errorMessage: "User doesn't exist"})
    return
  }
  if (!req.body.password){
    res.status(200).send({errorMessage: "No password"})
    return
  }
  if (user.password != req.body.password){
    res.status(200).send({errorMessage: "Incorrect password"})
    return
  }
  res.send({data:user})
})
app.post("/api/sign-in", async (req, res)=>{
  if (!req.body.user){
    res.status(200).send({errorMessage: "User is missing"})
    return
  }
  if (!req.body.password){
    res.status(200).send({errorMessage: "Password is missing"})
    return
  }
  if (!req.body.email){
    res.status(200).send({errorMessage: "Email is missing"})
    return
  }
  const userCheck = await User.findOne({name: req.body.user }).exec()
  if (userCheck){
    res.status(200).send({errorMessage: "User already existing"})
    return
  }
  const newUser = new User({
    name: req.body.user, 
    password: req.body.password,
    email: req.body.email,
    math_quiz: null
  })
  newUser.save()
  res.send({message: 'User successfully added'})
})

app.get("/api/quiz", async (req, res)=>{
  await User.findOne({name:{$eq: req.query.user}}).then((data)=>{
    res.send({data:data})
  }).catch((err)=>{
    console.error(err);
  })
  // const user = await User.findOne({name:{$eq: req.body.user}})
  // console.log(user)
  // res.send({data:user})
})
app.post("/api/quiz-answer", async (req,res)=>{
  const user = await User.findOne({name: req.body.user })
  user.math_quiz = req.body.grade
  user.save()
  res.send({data:user})
})

app.listen(3001, (err) => {
  console.log("Listening on port 3001");
});
