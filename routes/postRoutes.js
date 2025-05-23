
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Serve static images properly
router.use('/uploads', express.static('uploads'));

// 🔹 Create a new post with an image
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = 'INSERT INTO posts (user_id, title, content, image_url) VALUES (?, ?, ?, ?)';
  db.query(query, [userId, title, content, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating post' });
    res.status(201).json({ message: 'Post created with image' });
  });
});

// 🔹 Get all posts (with images & author info)
router.get('/', (req, res) => {
  const query = `
    SELECT posts.id, posts.title, posts.content, posts.image_url, posts.created_at, posts.user_id, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching posts' });
    res.json(results);
  });
});

// 🔹 Update a post (ownership check)
router.put('/:id', verifyToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  const checkQuery = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [postId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error verifying ownership' });

    if (results.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to edit this post' });
    }

    const updateQuery = 'UPDATE posts SET content = ? WHERE id = ?';
    db.query(updateQuery, [content, postId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error updating post' });
      res.json({ message: 'Post updated successfully' });
    });
  });
});

// 🔹 Delete a post (ownership check)
router.delete('/:id', verifyToken, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const checkQuery = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
  db.query(checkQuery, [postId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error verifying ownership' });

    if (results.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    const deleteQuery = 'DELETE FROM posts WHERE id = ?';
    db.query(deleteQuery, [postId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Error deleting post' });
      res.json({ message: 'Post deleted successfully' });
    });
  });
});

module.exports = router;
