const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    Fname:{
        type:String,
        requred:true
    },
    Lname:{
        type:String,
        requred:true
    },
    username:{
        type:String,
        requred:true
    },
    email:{
        type:String,
        requred:true
    },
    phone:{
        type:Number,
        requred:true
    },
    password:{
        type:String,
        requred:true
    },
    is_Verified:{
        type:Boolean,
        required:false
    },
    is_Admin:{
        type:Boolean,
        requred:false
    },
    is_block:{
        type:Boolean,
        default:false
    },
    
},{
    timestamps: true 
})

module.exports=mongoose.model("User",userSchema)