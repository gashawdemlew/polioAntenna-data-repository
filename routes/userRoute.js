const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Updated path
const Student = require('../models/userModel'); // Updated path
const Post = require('../models/blog');
const Comment = require('../models/comment');
const Like = require('../models/like');

// Define the routes
router.post('/create', userController.create);
router.post('/login', userController.Login);

router.get('/getAllUser', userController.getAllUser);
router.post('/getUserByPhoNno', userController.getUserByPhoNno);
router.put('/updateUserPhoNo', userController.updateUserPhoNo);

router.get('/:id', userController.getStudentById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteStudent);
router.get('/api/posts', async (req, res) => {
    try {
      const posts = await Post.findAll();
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })

  router.post('/posts', async (req, res) => {
    try {
      const { title, content, author } = req.body;
      const post = await Post.create({ title, content, author });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.delete('/posts/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await Post.destroy({ where: { id } });
      res.json({ message: 'Post deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/posts/:id/comments', async (req, res) => {
    try {
        const { content, author } = req.body;
        const comment = await Comment.create({
            content,
            author,
            postId: req.params.id,
        });

        const updatedComments = await Comment.findAll({ where: { postId: req.params.id } });
        res.json(updatedComments); // Return all comments for the post
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

  // Fetch comments
  router.get('/posts/:id/comments', async (req, res) => {
    try {
      const comments = await Comment.findAll({ where: { postId: req.params.id } });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Like a post
  router.post('/posts/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const existingLike = await Like.findOne({ where: { postId: req.params.id, userId } });

        if (existingLike) {
            await Like.destroy({ where: { id: existingLike.id } }); // Unlike
            res.json({ message: 'Like removed' });
        } else {
            const like = await Like.create({ postId: req.params.id, userId });
            res.json({ message: 'Liked', like });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

  
  // Get likes count
  router.get('/posts/:id/likes', async (req, res) => {
    try {
      const likes = await Like.count({ where: { postId: req.params.id } });
      res.json({ likes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
module.exports = router;