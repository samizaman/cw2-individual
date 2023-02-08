// Import dependencies modules
const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize Express and MongoDB
const app = express();
const port = process.env.PORT || 3000;
const connectionString = process.env.CONNECTION_STRING;
let db;

// Check if the connection string is defined in the environment variables
if (!connectionString) {
  console.error('The connection string is not defined in the environment variables');
  return;
}

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
    // Get the name of the image from the request parameters
    const name = req.params.name;

    // Join the directory and image name to form the file path
    const file = path.join(__dirname, "public\\" + name)

    // Check if the file exists in the specified directory
    if (!fs.existsSync(file)) {
      // Throw an error if the image file does not exist
      throw new Error(`The image "${name}" does not exist`)
    }

    // Send the file to the client
    res.sendFile(file)
  } catch (error) {
    // Handle any errors that may occur and pass them to the next middleware
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
      return res.status(500).send({ success: false, message: error.message });
    }
    res.status(200).send({ success: true, message: 'Order added successfully' });
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
      if (result.modifiedCount === 1) {
        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    });
});


// This is a GET route for searching a collection in the database.
app.get("/collection/:collectionName/:search", (req, res, next) => {
  // The collection is found using the find() method with a search query. 
  req.collection.find({ 
    // The search query uses the $or operator to match either the topic or location in the collection.
    $or: [
      // The topic is matched using a regex expression, using the search parameter from the route, case insensitive.
      { subject: { $regex: `.*${req.params.search}.*`, $options: 'i' } }, 
      // The location is matched using a regex expression, using the search parameter from the route, case insensitive.
      { location: { $regex: `.*${req.params.search}.*`, $options: 'i' } }
    ] 
  // The toArray() method is used to convert the results from the find() method into an array.
  }).toArray((error, results) => {
    // If there is an error, it is passed to the next middleware function.
    if (error) {
      return next(error);
    } 
    // The results are sent as a response to the client.
    res.send(results);
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
