const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    user_id :{
        type :String,
        requred:true
    },
    Name :{
        type :String,
        requred:true
    },
    Mobile :{
        type : Number,
        requred:true
    },
    PIN:{
        type :Number,
        requred:true
    },
    Locality:{
        type:String,
        requred:true
    },
    address :{
        type :String,
        requred:true
    },
    city :{
        type :String,
        requred:true
    },
    state :{
        type :String,
        requred:true
    },
    landmark :{
        type :String,
    },
    alternatePhone :{
        type :String,
    },
    is_Home:{
        type:Boolean,
        default:false
    },
    is_Work:{
        type:Boolean,
        default:false
    },
})

module.exports= mongoose.model('Address',addressSchema)