const express = require('express');
const router = express.Router();
const Post=require('../models/post');
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg',
}

const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("invalid mime type");
    if(isValid) {
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename: (req,file,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' +Date.now() + '.' + ext);
  }
})

router.post('',checkAuth, multer({storage: storage}).single('image'),(req,res,next)=>{
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  // console.log(req.UserData.userId);
  // post.save();
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added succesfully',
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.title,
        imagePath: createdPost.imagePath,
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Creating post failed'
    })
  })
});

router.put('/:id',checkAuth, multer({ storage: storage}).single('image'),(req,res,next)=>{
  let imagePath = req.body.imagePath;
  // console.log(req.file);
  if(req.file) {
  const url = req.protocol + '://' + req.get("host");
  imagePath = url + '/images/' + req.file.filename
  }
  const post=new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  console.log(imagePath);
  Post.updateOne({_id:req.params.id, creator: req.userData.userId},post).then(result => {
    // console.log(result);
    if(result.nModified > 0) {
      res.status(200).json({message: 'Update Succesfull'});
    } else {
      res.status(401).json({message: 'Not authorized!'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'unable to update post'
    })
  });
});


router.get('',(req,res,next)=>{
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  if (pageSize && currentPage ) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery.then(documents=>{
    fetchedPosts = documents;
    return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: "Posts fetched Succesfully",
      posts: fetchedPosts,
      maxPosts: count
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'fetching post failed'
    })
  })
});

router.get('/:id',(req,res,next)=>{
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'fetching post failed'
    })
  })
})

router.delete("/:id",checkAuth,(req,res,next)=>{
  // console.log(req.params.id);
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId }).then(result =>{
    // console.log(result);
    if(result.n > 0) {
      res.status(200).json({message: 'Delete Succesfull'});
    } else {
      res.status(401).json({message: 'Not authorized!'});
    }

  })
  .catch(error => {
    res.status(500).json({
      message: 'deleting post failed'
    })
  })
});


module.exports = router;
