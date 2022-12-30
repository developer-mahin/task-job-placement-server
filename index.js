const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 5000;
require("dotenv").config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.eedstvb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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
        app.post("/add_tasks", async (req, res) => {
            const taskInfo = req.body
            const result = await tasksCollection.insertOne(taskInfo)
            res.send(result)
        })

        // get method with for getting specific added task
        app.get("/my_tasks", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await tasksCollection.find(query).toArray()
            res.send(result)
        })

        // patch method for complete button
        app.patch("/completed_task/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    task_status: "completed"
                }
            }
            const result = await tasksCollection.updateOne(query, updatedDoc, options)
            res.send(result)
        })

        // get method for getting specific users task
        app.get("/my_completed_task", async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email,
                task_status: "completed"
            }
            const result = await tasksCollection.find(query).toArray()
            res.send(result)
        })

        // delete method for delete task
        app.delete("/delete_task/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await tasksCollection.deleteOne(query)
            res.send(result)
        })

        app.patch("/update_task/:id", async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body.description;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    description: updateInfo
                }
            }
            const result = await tasksCollection.updateOne(query, updatedDoc, option)
            res.send(result)
        })

        // patch method for 
        app.patch("/comment/:id", async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body.comment;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    comment: updateInfo
                }
            }
            const result = await tasksCollection.updateOne(query, updatedDoc, options)
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
