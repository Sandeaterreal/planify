require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connecté");
});

app.post("/register", async (req,res)=>{

  const hash = await bcrypt.hash(
    req.body.password,
    10
  );

  const user = new User({
    username:req.body.username,
    email:req.body.email,
    password:hash
  });

  await user.save();

  res.json({
    message:"Compte créé"
  });

});

app.post("/login", async (req,res)=>{

  const user = await User.findOne({
    email:req.body.email
  });

  if(!user)
    return res.status(400).send();

  const valid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if(!valid)
    return res.status(400).send();

  const token = jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET
  );

  res.json({
    token,
    userId:user._id
  });

});

app.post("/task", async(req,res)=>{

  const task = new Task(req.body);

  await task.save();

  res.json(task);

});

app.get("/tasks/:id", async(req,res)=>{

  const tasks = await Task.find({
    userId:req.params.id
  });

  res.json(tasks);

});

app.get("/tasks", async (req, res) => {
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  
  const tasks = await Task.find({ userId });
  res.json(tasks);
});

app.delete("/task/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000,()=>{
  console.log(
    "Serveur démarré sur http://localhost:3000"
  );
});