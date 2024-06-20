const mongoose = require('mongoose')

const authschema = new mongoose.authschema({
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


const auth = mongoose.model('auth', authschema)

module.exports = auth