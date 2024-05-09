const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({
    offer: {
        type: String,
        required: true
    },
    offerType: {
        type: String,
        required: true
    },
    Pname: {
        type: String,

    },
    category: {
        type: String,

    },
    discount: {
        type: Number,
        required: true

    },
    expiredate: {
        type: Date,
        required: true
    },
    maxRedimabelAmount: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Offer', offerSchema)