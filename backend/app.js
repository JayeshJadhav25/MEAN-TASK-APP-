const express=require('express');
const bodyParser=require("body-parser");
const mongoose=require('mongoose');
const cors= require('cors');
const path= require('path');
require('dotenv').config()


const app=express();

const postsRoutes = require('./router/posts');
const userRoutes = require('./router/user');
// console.log(process.env.MONGO_ATLAS_PW);

app.use(cors());
mongoose.connect("mongodb+srv://Jayesh:" + process.env.MONGO_ATLAS_PW + "@cluster0-dgqkb.mongodb.net/node-angular?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=>{
      console.log("Connected Succesfully");
  })
  .catch(()=>{
    console.log("Connection Failed");
  })


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use('/images',express.static(path.join("backend/images")));

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept, Authorization"
    );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS"
  );

  next();
});

app.use('/api/posts',postsRoutes);
app.use('/api/user',userRoutes);



module.exports=app;
