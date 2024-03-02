const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const dotenv = require('dotenv');
 

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex :true }).then(()=>{
    console.log("Connected to DB");
    app.listen(config.port,()=>{
        console.log("Sercer connectd sucessfully on port "+config.port);
    })
}).catch((err)=>{console.log("error on Server connection "+err)});

let server;

