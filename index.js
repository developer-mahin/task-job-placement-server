const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 5000;
require("dotenv").config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.eedstvb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ accessToken: "Unauthorized Access" })
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ accessToken: "Forbidden Access" })
        }
        req.decoded = decoded
    })
    next()
}

async function run() {

    const usersCollection = client.db("task-job-placement").collection("users")
    const tasksCollection = client.db("task-job-placement").collection("tasks")

    try {
        // post method for saving user 
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        // json web token 
        app.get("/jwt", async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const token = jwt.sign(user, process.env.JSON_WEB_TOKEN, { expiresIn: "1d" })
            res.send({ access_token: token })
        })

        // post method for adding task
        app.post("/add_tasks", async(req, res)=>{
            const taskInfo = req.body
            const result = await tasksCollection.insertOne(taskInfo)
            res.send(result)
        })

        // get method with for getting specific added task
        app.get("/my_tasks", async(req, res)=>{
            const email = req.query.email;
            const query = {email: email};
            const result = await tasksCollection.find(query).toArray()
            res.send(result)
        })



    } catch (error) {
        console.log(error.message);
    }

}

run().catch(err => { console.log(err.message) })

app.get("/", async (req, res) => {
    res.send("task server is running")
})

app.listen(port, () => {
    console.log(`App running on the port ${port}`)
})
