const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
app.use(cors());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0wqac.mongodb.net/burjAlArab?retryWrites=true&w=majority`;


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

var serviceAccount = require("./configs/burj-al-arab-9122f-firebase-adminsdk-px2az-f1863913f7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  

  app.post('/addBooking', (req, rea) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then( (error, result) => {
        res.send(result.insertedCount > 0)
      })
      
  })

  app.get('/bookings', (req, res) => {
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
        let tokenEmail = decodedToken.email;
        if(tokenEmail == req.query.email){
            bookings.find({email: req.query.email})
            .toArray((error, documents) => {
                res.send(documents);
            })
        }
        else{
            res.status(401).send('un authorized access');
        }
        }).catch(function(error) {
            res.status(401).send('un authorized access');
        });
      }
      else{
          res.status(401).send('un authorized access');
      }
      
  })

});
app.listen(4000, () => console.log("Port 4000 is listening to start"));



