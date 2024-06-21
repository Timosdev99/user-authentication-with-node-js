require('dotenv').config()
const mongoose = require('mongoose')
const mongo_url = process.env.MONGO_DB


mongoose.connect(mongo_url, {
    dbName: process.env.DATA_BASE
}).then(() => {
    console.log('connected to database succesfully')
})
.catch((err) => {
    console.log(`this is the error: ${err}`)
})