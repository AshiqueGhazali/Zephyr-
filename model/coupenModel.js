const mongoose = require('mongoose')

const coupenSchema = mongoose.Schema({
    coupenCode :{  
        type:String,
        required:true,
        unique:true
      },
      status:{
        type:Boolean,
        default:true
      },
      discountPercentage:{
        type:Number,
        required:true
      },
      expiredDate:{
        type: Date,
        required: true,
      },
      createdDate:{
        type: Date,
        required: true,
        default:Date.now()
      },
      minPurchaseAmt:{
        type:Number,
        required:true
      },
      maxRedimabelAmount:{
        type:Number,
        required:true
      }
})

module.exports = mongoose.model('Coupen',coupenSchema)