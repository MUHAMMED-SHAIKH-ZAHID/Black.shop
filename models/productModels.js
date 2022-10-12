const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productschema = new Schema({
    pro_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    material:{
        type:String,
    },
    size: {
        type: String,
    },
    price: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',

    },
    SubCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory',

    },
    Stock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    myimg: {
        type: Array,

    }

}, {timestamps:true})

const product = mongoose.model('product', productschema)
module.exports = product;

