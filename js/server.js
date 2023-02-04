// Import dependencies modules
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();

// Initialize Express and MongoDB
const app = express();
const port = process.env.PORT;
const connectionString = process.env.CONNECTION_STRING;
let db;

// Connect to MongoDB
MongoClient.connect(connectionString, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log('Error connecting to MongoDB:', err);
  } else {
    console.log('Connected to MongoDB 🎉');
    db = client.db('coach');
  }
});

// Configure Express
app.use(express.json());
app.set('port', port);
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});


// Serve images
app.use('/images', express.static(path.join(__dirname, '../images')));


// Handle missing images
app.use((req, res, next) => {
  if (req.url.startsWith('/images')) {
    res.status(404).send('Image not found.');
  } else {
    next();
  }
});

// Define the root endpoint
app.get('/', (req, res) => {
  res.send('Select a collection, e.g., /collection/lessons');
});


// Define the collection parameter
app.param('collectionName', (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  next();
});


// Define the collection endpoint
app.get('/collection/:collectionName', (req, res, next) => {
  req.collection.find({}).toArray((error, results) => {
    if (error) {
      return next(error);
    } else {
      if (results) {
        res.send(results);
      } else {
        return next(new Error('No data found in the collection'));
      }
    }
  });
});


app.post('/collection/:collectionName', (req, res) => {
  req.collection.insertOne({
    name: req.body.name,
    phone: req.body.phone,
    lessons: req.body.lessons
  }, (error, result) => {
    if (error) {
      return res.status(500).send({ success: false });
    }
    res.status(200).send({ success: true });
  });
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
