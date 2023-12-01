const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ykirh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectToDatabase = async () => {
  const client = await MongoClient.connect(uri, options);
  return client;
};

// Middleware to handle MongoDB connections
const withDatabase = async (req, res, next) => {
  try {
    const client = await connectToDatabase();
    req.databaseClient = client;
    next();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Root route
app.get('/', (req, res) => {
  res.send('App is Working');
});

app.post('/addService', withDatabase, async (req, res) => {
  try {
    const serviceCollection = req.databaseClient.db('binaryFixer').collection('services');
    const newService = req.body;

    console.log('Adding new service:', newService);

    await serviceCollection.insertOne(newService);
    res.send(true);
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient.close();
  }
});

// Get services
app.get('/services', withDatabase, async (req, res) => {
  try {
    const serviceCollection = req.databaseClient.db('binaryFixer').collection('services');
    const documents = await serviceCollection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving services:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient.close();
  }
});

// Add testimonial
app.post('/addTestimonial', withDatabase, async (req, res) => {
  try {
    const testimonialCollection = req.databaseClient.db('binaryFixer').collection('testimonials');
    const newTestimonial = req.body;

    console.log('Adding new Testimonial:', newTestimonial);

    const result = await testimonialCollection.insertOne(newTestimonial);

    if (result.insertedCount > 0) {
      res.status(201).send('Testimonial added successfully');
    } else {
      res.status(500).send('Failed to add testimonial');
    }
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient.close();
  }
});

// Get testimonials
app.get('/testimonials', withDatabase, async (req, res) => {
  try {
    const testimonialCollection = req.databaseClient.db('binaryFixer').collection('testimonials');
    const documents = await testimonialCollection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving testimonials:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient.close();
  }
});

// Get order by ID
app.get('/order/:id', withDatabase, async (req, res) => {
  try {
    const ordersCollection = req.databaseClient.db('binaryFixer').collection('orders');
    const document = await ordersCollection.findOne({ _id: ObjectId(req.params.id) });
    res.send(document);
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient.close();
  }
});

// Add order
app.post('/addOrder', withDatabase, async (req, res) => {
  const order = req.body;

  try {
    const ordersCollection = req.databaseClient.db('binaryFixer').collection('orders');
    const result = await ordersCollection.insertOne(order);
    res.send(result.insertedCount > 0);
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient.close();
  }
});

// Get orders by email
app.get('/orders/:email', withDatabase, async (req, res) => {
  try {
    const adminCollection = req.databaseClient.db('binaryFixer').collection('adminEmail');
    const adminData = await adminCollection.find({ email: req.params.email }).toArray();
    const ordersCollection = req.databaseClient.db('binaryFixer').collection('orders');
    const ordersData = adminData.length === 0 ? ordersCollection.find({ email: req.params.email }) : ordersCollection.find({});
    const orders = await ordersData.toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient && req.databaseClient.close();
  }
});

// Get admin data by email
app.get('/admin/:email', withDatabase, async (req, res) => {
  try {
    const adminCollection = req.databaseClient.db('binaryFixer').collection('adminEmail');
    const adminData = await adminCollection.find({ email: req.params.email }).toArray();
    res.send(adminData);
  } catch (error) {
    console.error('Error retrieving admin data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient && req.databaseClient.close();
  }
});

// Add new admin
app.post('/makeAdmin', withDatabase, async (req, res) => {
  const newAdmin = req.body;
  console.log('Adding new Admin:', newAdmin);

  try {
    const adminCollection = req.databaseClient.db('binaryFixer').collection('adminEmail');
    const result = await adminCollection.insertOne(newAdmin);
    res.send(result.insertedCount > 0);
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient && req.databaseClient.close();
  }
});

// Delete service by ID
app.delete('/delete/service/:id', withDatabase, async (req, res) => {
  const id = ObjectId(req.params.id);

  try {
    const serviceCollection = req.databaseClient.db('binaryFixer').collection('services');
    const result = await serviceCollection.deleteOne({ _id: id });
    res.send(result.deletedCount > 0);
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient && req.databaseClient.close();
  }
});

// Update order status by ID
app.patch('/updateStatus/:id', withDatabase, async (req, res) => {
  const id = ObjectId(req.params.id);

  try {
    const ordersCollection = req.databaseClient.db('binaryFixer').collection('orders');
    const result = await ordersCollection.updateOne(
      { _id: id },
      { $set: { state: req.body.status } }
    );
    res.send(result.modifiedCount > 0);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the MongoDB connection in the 'finally' block to ensure it's always closed
    req.databaseClient && req.databaseClient.close();
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
