// Import dependencies modules
const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const path = require('path');
const cors = require('cors');
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
app.set('port', port);

// Use cors middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  next();
});



// Serve images
app.use('/images', express.static(path.join(__dirname, '../images')));


app.use((express.static("public")));


// Param middleware
app.param('collectionName', (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  next();
});


// GET request for lessons
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


// GET request to get a single image
app.get('/images/:name', (req, res, next) => {
  try {
    const name = req.params.name;
    res.sendFile(path.join(__dirname, "public\\" + name))
  } catch (error) {
    next(error);
  }
});


// POST request to add a new lesson to orders
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


// PUT request to update a lesson
app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.updateOne(
    {
      _id: new ObjectID(req.params.id),
    },
    { $set: req.body },
    { safe: true, multi: false },
    (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send(result);
    });
});


// GET request to search for a lesson
app.get("/collection/:collectionName/:search", (req, res, next) => {
  const sh = req.params.search;
  req.collection.find(
    {subject: sh},
    (error, results) => {
      if (error) {
        return next(error);
      } else{
        res.send(results);
      }
    });
  });
  


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
