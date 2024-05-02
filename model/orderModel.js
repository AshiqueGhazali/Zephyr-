const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    userId :{
        type : mongoose.SchemaTypes.ObjectId,
        required : true
    },
    orderItems :[{
        productId : {
            type:mongoose.SchemaTypes.ObjectId,
            required:true
        },
        quantity: {
            type: Number,
            required: true,
            default : 1
        },
        productName :{
            type:String,
            requred:true
        },
        brand:{
            type:String,
            requred:true
        },
        model:{
            type:String,
            requred:true
        },
        category:{
            type:String,
            requred:true
        },
        description:{
            type:String,
            requred:true
        },
        price:{
            type:Number,
            requred:true
        },
        discountPrice:{
            type:Number,
            requred:true
        },
        discount:{
            type:Number,
            requred:true
        },
        dialColor:{
            type:String,
            requred:true
        },
        strapColor:{
            type:String,
            requred:true
        },
        image:[{
            type:String,
            requred:true
        }]
    }],
    paymentMethod :{
        type:String,
        required:true
    },
    razorpayOrderId: {
        type: String,
        required: false
    },
    orderDate: {
        type:Date,
        default:Date.now()
    },
    address : {
        Name : {
            type:String,
            required:true
        },
        email :{
            type:String,
            required:true
        },
        Mobile : {
            type:Number,
            required:true
        },
        PIN : {
            type:Number,
            required:true
        },
        Locality : {
            type:String,
            required:true
        },
        address : {
            type:String,
            required:true
        },
        city : {
            type:String,
            required:true
        },
        state : {
            type:String,
            required:true
        },
        landmark : {
            type:String,
        },
        alternatePhone : {
            type:String,
        },
        is_Home : {
            type:Boolean,
            default:false
        },
        is_Work : {
            type:Boolean,
            default:false
        },
    },
    orderStatus: {
        type: String,
        default: "pending",
        required: true
    },
    returnReason: {
        type: String,
    },
    cancelReason: {
        type: String,
    },
    totalAmount: {
        type: Number
    }
})

module.exports = mongoose.model('Order',orderSchema)