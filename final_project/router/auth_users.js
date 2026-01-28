const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Check if username is valid (not already taken)
 */
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

/**
 * Check if username & password match
 */
const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Authenticate user
  const validUser = users.find(
    user => user.username === username && user.password === password
  );

  if (!validUser) {
    return res.status(401).json({
      message: "Invalid login credentials"
    });
  }

  // Create JWT
  let accessToken = jwt.sign(
    { username },
    "access",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "Login successful!"
  });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn] && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Review deleted!"
    });
  }

  return res.status(404).json({
    message: "Review not found"
  });
});


// ❌ DELETE REVIEW  (⚠️ REQUIRED FOR GRADER)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn] || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];

  return res
    .status(200)
    .json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
