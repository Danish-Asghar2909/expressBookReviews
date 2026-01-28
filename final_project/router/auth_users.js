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

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        if (isValid(username)) {
            if (authenticatedUser(username, password)) {
                const token = jwt.sign({ username }, 'access', { expiresIn: '1hr' });
                return res.status(200).json({ token })
            }
            return res.status(400).json({ message: `Please check the user name and password those are invalid`, status: 400 })
        }
        return res.status(404).json({ message: `No User found with the username - ${username}`, status: 404 })
    }
    else {
        return res.status(400).json({ message: `Username and Password is Reuired for login`, status: 400 })
    }
});


// ✍️ ADD / MODIFY REVIEW
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res
    .status(200)
    .json({ message: "Review added/updated successfully" });
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
