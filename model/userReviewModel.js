const mogoose = require('mongoose')

const reviewSchema = mogoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        // required:true
    },
    Message:{
        type:String,
        required:true
    },
    produtId:{
        type:String,
        // required:true
    }
})

module.exports= mogoose.model('Review',reviewSchema)