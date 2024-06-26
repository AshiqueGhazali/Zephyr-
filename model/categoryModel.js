const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        requred:true
    },
    imageUrl:{
        type:String,
        requred:true
    },
    description:{
        type:String,
        requred:true
    },
    status:{
        type:Boolean,
        default:true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
})

module.exports=mongoose.model('Category',categorySchema)