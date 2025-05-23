const db = require("../config/db");

const createUser = (username, email, hashedPassword, callback) => {
  db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword], callback);
};

const findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

module.exports = { createUser, findUserByEmail };
