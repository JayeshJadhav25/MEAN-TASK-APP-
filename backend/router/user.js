const express=require('express');
const router=express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup',(req,res)=> {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'user created',
            result: result
          })
        })
        .catch(err => {
          res.status(500).json({
              message: "Invalid authentication credentials"
          })
        })
    });
})

router.post('/login',(req,res)=>{
  let fetchedUser;
  User.findOne({ email: req.body.email}).then(user => {
    if(!user) {
      return res.status(401).json({
        message:'auth failed'
      });
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password);
  })
  .then(result => {
    if(!result) {
      return res.status(401).json({
        message:'auth failes'
      });
    }
    const token = jwt.sign({email: fetchedUser.email, userId: fetchedUser._id}, process.env.JWT_KEY,{expiresIn: "1h"});
    res.status(200).json({
      token: token,
      expireIn: 3600,
      userId: fetchedUser._id
    })
  })
  .catch(err => {
    return res.status(401).json({
      message: 'Invalid authentication crediential'
    })
  })
})

module.exports = router;
