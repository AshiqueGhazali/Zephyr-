// const { log } = require('console')
const express = require('express')
const mongoose = require('mongoose')
const path = require("path")
const dotenv = require('dotenv')
const nocache = require('nocache')
const app = express()
const morgan = require('morgan')

mongoose.connect("mongodb://127.0.0.1:27017/zephyr_eCommerce")
// mongoose.connect(process.env.MONGO_URL)


dotenv.config({path:'.env'})

const userRout = require("./routes/userRout.js")
app.use("/",userRout)

const adminRout = require("./routes/adminRout.js")
app.use('/admin',adminRout)

app.use(nocache()) 
// app.use(morgan('dev')) 

app.use(express.static("public"))
app.use("/assets",express.static(path.join(__dirname,'public/assets')))
app.use('/css',express.static(path.join(__dirname,'public/css')))
app.use('/js',express.static(path.join(__dirname,'public/js')))

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`Server Running on http://localhost:${port}`);
})