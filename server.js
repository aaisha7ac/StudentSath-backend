require('dotenv').config()
const express = require('express');
const userData = require('./user.json')
const fs = require('fs');
const cookie = require('cookie-parser');
const session = require('express-session');
const app = express();
const cors = require('cors');
app.use(cors());



const { MongoClient } = require('mongodb');

const uri = process.env.Mongo_url;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

let db;
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log('mongodb connected')
    db = client.db('StudentSathi');
    // Send a ping to confirm a successful connection
  }catch(err){
    console.log("error found")
    console.log(err)
  }
}
run();



app.use(cookie());
app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: "abc"
}))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//Handling endpoints

app.get('/getdata', (req, res) => {
    res.send('Hello I am sending Data');
})
app.post('/getdata/:course', (req, res) => {
    //console.log(req.body);
    fs.readFile(`./data/${req.params.course}.json`, 'utf-8', (err, data) => {
        if (err) {
            res.send({ msg: "Error" });
        }
        else {
            if (req.body.location != 'None') {
                data = JSON.parse(data);
                let colleges = data.filter((value) => {
                    return value.state === req.body.location
                })
                res.send(colleges);
            }
            else {
                res.send(data);
            }
        }
    })

})


app.post('/getRole/:role',(req,res)=>{
   
    fs.readFile(`./roles/${req.params.role}.json`,'utf-8',(err,data)=>{
        if(err){
            res.send({msg:"Error"});
        }
        else{
            res.send(data);
        }
    })
})


app.post('/login', async(req, res) => {

    try {
        const userData = req.body;
    const user = await db.collection('user').findOne({ username: userData.username });
    if (user) {
        // If user exists, send success response with username
        res.send({ status: true, username: user.username });
    } else {
        // If user doesn't exist, send failure response
        res.send({ status: false });
    }
    } catch (error) {
        console.error(err);
        res.send({ status: false });
    }
   
})

app.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        // Insert the user data into the collection
        await db.collection('user').insertOne(userData);
        // Send success response
        res.send({ status: true });
    } catch (err) {
        console.error(err);
        // Send failure response
        res.send({ status: false });
    } 
});

app.listen(5000, () => {
    console.log("Server running successfully at port 5000");
})
