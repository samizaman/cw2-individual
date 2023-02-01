// Import dependencies modules
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// Create an express.js instance
const app = express();
const port = process.env.PORT;
const connection_string = process.env.CONNECTION_STRING

// config Express.js
app.use(express.json());
app.set('port', port);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// connect to MongoDB
let db;

MongoClient.connect(connection_string, (err, client) => {
    db = client.db('coach');
})

let products = [{
    id: 1001,
    subject: "Art and Craft",
    price: 1000,
    image: "images/art.png",
    rating: 1,
    location: "Al Taawun, Sharjah",
    space: 5,
  },
  {
    id: 1002,
    subject: "Cooking",
    price: 20,
    image: "images/cooking.png",
    rating: 2,
    location: "Gold 2 Towers, Dubai",
    space: 5,
  },
  {
    id: 1003,
    subject: "Pottery",
    price: 200,
    image: "images/pottery.png",
    rating: 3,
    location: "Knowledge Village, Dubai",
    space: 5,
  },
  {
    id: 1004,
    subject: "Chess",
    price: 100,
    image: "images/chess.png",
    rating: 4,
    location: "Jumeriah Lake Tower, Dubai",
    space: 5,
  },
  {
    id: 1005,
    subject: "Maths",
    price: 10000,
    image: "images/maths.png",
    rating: 5,
    location: "Zulekha Hospital, Dubai",
    space: 5,
  },
  {
    id: 1006,
    subject: "Robotics",
    price: 1600,
    image: "images/robotics.png",
    rating: 5,
    location: "One Tower, Dubai",
    space: 5,
  },
  {
    id: 1007,
    subject: "Coding",
    price: 170,
    image: "images/coding.png",
    rating: 5,
    location: "Mubarak Center, Sharjah",
    space: 5,
  },
  {
    id: 1008,
    subject: "Swimming",
    price: 1800,
    image: "images/swimming.png",
    rating: 5,
    location: "Rolla Square, Dubai",
    space: 5,
  },
  {
    id: 1009,
    subject: "Martial Arts",
    price: 190,
    image: "images/martial-arts.png",
    rating: 5,
    location: "Town Square, Dubai",
    space: 5,
  },
  {
    id: 1430,
    subject: "Gymnastics",
    price: 10000,
    image: "images/gymnastics.png",
    rating: 5,
    location: "La Mer, Dubai",
    space: 5,
  },
]