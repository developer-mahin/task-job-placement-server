const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.eedstvb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    const usersCollection = client.db("task-job-placement").collection("users")

    try {

        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
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
