const db = require('../config/db');

// Create a new post
const createPost = (req, res) => {
  const { title, content, user_id } = req.body;
  const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, content, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating post', error: err });
    res.status(201).json({ message: 'Post created successfully' });
  });
};

// Get all posts
const getPosts = (req, res) => {
  const query = 'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching posts', error: err });
    res.status(200).json(results);
  });
};


// routes/posts.js
router.get('/', (req, res) => {
    const query = `
      SELECT posts.id, posts.title, posts.content, posts.created_at, posts.user_id, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching posts' });
      }
      res.json(results); // all posts from all users
    });
  });
  
// Get a single post
const getPostById = (req, res) => {
  const query = 'SELECT * FROM posts WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching post', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(results[0]);
  });
};

// Update a post
const updatePost = (req, res) => {
  const { title, content } = req.body;
  const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
  db.query(query, [title, content, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating post', error: err });
    res.status(200).json({ message: 'Post updated successfully' });
  });
};

// Delete a post
const deletePost = (req, res) => {
  const query = 'DELETE FROM posts WHERE id = ?';
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting post', error: err });
    res.status(200).json({ message: 'Post deleted successfully' });
  });
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
