const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 5005;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ykirh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectToMongoDB = async () => {
  try {
    const client = await MongoClient.connect(uri, options);

    const db = client.db("binaryFixer");
    const serviceCollection = db.collection("services");
    const testimonialCollection = db.collection("testimonials");
    const ordersCollection = db.collection("orders");
    const adminCollection = db.collection("adminEmail");

    return {
      serviceCollection,
      testimonialCollection,
      ordersCollection,
      adminCollection,
    };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

(async () => {
  try {
    const dbCollections = await connectToMongoDB();

    // Use the collections here
    const serviceCollection = dbCollections.serviceCollection;
    const testimonialCollection = dbCollections.testimonialCollection;
    const ordersCollection = dbCollections.ordersCollection;
    const adminCollection = dbCollections.adminCollection;

    app.post('/addService', async (req, res) => {
      const newService = req.body;
      console.log('adding new service: ', newService);
    
      try {
        await serviceCollection.insertOne(newService);
        res.send(true);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error adding service');
      }
    });
      
    app.get('/services', async (req, res) => {
      try {
        const documents = await serviceCollection.find({}).toArray();
        res.send(documents);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving services');
      }
    });
    
    app.post('/addTestimonial', async (req, res) => {
      const newTestimonial = req.body;
      console.log('adding new Testimonial: ', newTestimonial);
    
      try {
        const result = await testimonialCollection.insertOne(newTestimonial);
        res.send(result.insertedCount > 0);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error adding testimonial');
    }
    });
    
    app.get('/testimonials', async (req, res) => {
    try {
      const documents = await testimonialCollection.find({}).toArray();
      res.send(documents);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving testimonials');
    }
    });
    
    app.get('/order/:id', async (req, res) => {
    try {
      const document = await serviceCollection.findOne({ _id: ObjectId(req.params.id) });
      res.send(document);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving order');
    }
    });
    
    app.post('/addOrder', async (req, res) => {
    const order = req.body;
    
    try {
      const result = await ordersCollection.insertOne(order);
      res.send(result.insertedCount > 0);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding order');
    }
    });  
    
    app.get('/orders/:email', (req, res) => {
        adminCollection.find({ email:req.params.email })
        .toArray( (err, adminData) => {
            if (adminData.length === 0) {
              ordersCollection.find( {email: req.params.email} )
              .toArray( (err, orders) => {
                res.send(orders);
              })
            } else {
              ordersCollection.find({})
              .toArray( (err, orders) => {
                res.send(orders);	
              })
            }
        })
    })
    
    app.get('/orders/:email', async (req, res) => {
      try {
        const adminData = await adminCollection.find({ email: req.params.email }).toArray();
        if (adminData.length === 0) {
          const orders = await ordersCollection.find({ email: req.params.email }).toArray();
          res.send(orders);
        } else {
          const orders = await ordersCollection.find({}).toArray();
          res.send(orders);
        }
      } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving orders');
      }
    });
    
    app.get('/admin/:email', async (req, res) => {
      try {
        const adminData = await adminCollection.find({ email: req.params.email }).toArray();
        res.send(adminData);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving admin data');
      }
    });
    
    app.post('/makeAdmin', async (req, res) => {
      const newAdmin = req.body;
      console.log('adding new Admin: ', newAdmin);
    
      try {
        const result = await adminCollection.insertOne(newAdmin);
        res.send(result.insertedCount > 0);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error adding admin');
      }
    });
    
    app.delete('/delete/service/:id', async (req, res) => {
      const id = ObjectId(req.params.id);
    
      try {
        const result = await serviceCollection.deleteOne({ _id: id });
        res.send(result.deletedCount > 0);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting service');
      }
    });
    
    app.patch('/updateStatus/:id', async (req, res) => {
      const id = ObjectId(req.params.id);
    
      try {
        const result = await ordersCollection.updateOne(
          { _id: id },
          { $set: { state: req.body.status } }
        );
        res.send(result.modifiedCount > 0);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error updating order status');
      }
    });
    
    app.get('/', (req, res) => {
      // Check if the database is connected
      if (serviceCollection) {
        res.send("Database is working");
      } else {
        res.status(500).send("Database connection failed");
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
