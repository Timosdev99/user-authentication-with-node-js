const mongoose = require('mongoose')

const authschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        
    },

    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    gender: {
        type: String,
        required: true,
        
    },

    refreshtoken: {
        type: String
    }
})


module.exports = mongoose.model('user', authschema)

 