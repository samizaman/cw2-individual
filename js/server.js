// Import dependencies modules
const express = require('express');
const { MongoClient } = require('mongodb');
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
  console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
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
app.get('/:collectionName', (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
      if (e) return next(e) // if error, pass to error handler else send the results
      res.send(results)
  })
})


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
