const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    head: {
        type: String, 
        required: true
    },
    subHead:{
        type: String, 
        required: true
    },
    bannerImage:{
        type: String, 
        required: true
    },
    status : {
        type : Boolean,
        default : true
    }
})

module.exports = mongoose.model('Banner',bannerSchema)