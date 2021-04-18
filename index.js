const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ykirh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("binaryFixer").collection("services");
  const testimonialCollection = client.db("binaryFixer").collection("testimonials");
  const ordersCollection = client.db("binaryFixer").collection("orders");
  const adminCollection = client.db("binaryFixer").collection("adminEmail");

  app.post('/addService', (req, res) => {
      const newService = req.body;
      console.log('adding new service: ', newService)
      serviceCollection.insertOne(newService)
      .then(result => {
          console.log('inserted count', result.insertedCount);
          res.send(result.insertedCount > 0)
      })
  })
  
  app.get('/services', (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
    	res.send(documents);
    })
  })
  
  app.post('/addTestimonial', (req, res) => {
      const newTestimonial = req.body;
      console.log('adding new Testimonial: ', newTestimonial)
      testimonialCollection.insertOne(newTestimonial)
      .then(result => {
          console.log('inserted count', result.insertedCount);
          res.send(result.insertedCount > 0)
      })
  })
  
  app.get('/testimonials', (req, res) => {
    testimonialCollection.find({})
    .toArray((err, documents) => {
    	res.send(documents);
    })
  })
  
  app.get('/order/:id', (req, res) => {
        serviceCollection.find({_id: ObjectId(req.params.id)})
        .toArray( (err, documents) => {
            res.send(documents[0]);
        })
    })
  
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })
    
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
  
  app.get('/admin/:email', (req, res) => {
  	adminCollection.find({ email:req.params.email })
  	.toArray( (err, adminData) => {
  		res.send(adminData);
  	})
  })
  
  app.post('/makeAdmin', (req, res) => {
      const newAdmin = req.body;
      console.log('adding new Admin: ', newAdmin)
      adminCollection.insertOne(newAdmin)
      .then(result => {
          console.log('inserted count', result.insertedCount);
          res.send(result.insertedCount > 0)
      })
  })
  
  app.delete('/delete/service/:id', (req, res) => {
      const id = ObjectId(req.params.id);
      serviceCollection.deleteOne({_id: id})
      .then(result => {
      	res.send(result.deletedCount > 0);
      })
  })
  
});

app.get('/', (req,res) => {
	res.send("Database is working");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
