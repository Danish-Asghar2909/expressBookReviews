const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Check if user already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  // Register new user
  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered"
  });
});


// 📚 GET ALL BOOKS
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// 📖 GET BY ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn]);
});

public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  let result = [];

  Object.entries(books).forEach(([isbn, book]) => {
    if (book.author === author) {
      result.push({
        isbn,
        author: book.author,
        title: book.title,
        reviews: book.reviews
      });
    }
  });

  return res.status(200).json(result);
});


// 🏷 GET BY TITLE
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const result = [];

  Object.values(books).forEach(book => {
    if (book.title === title) result.push(book);
  });

  return res.status(200).json(result);
});

// ⭐ GET REVIEW
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
