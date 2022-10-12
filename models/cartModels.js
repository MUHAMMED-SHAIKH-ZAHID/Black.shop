const mongoose = require('mongoose')

const cartschema=new  mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectID,         
        ref:'user'
    },
    Cart:[{
        product:{
            type:mongoose.Schema.Types.ObjectID,
            ref:'product'
        },
        quantity: {
            type:Number
       },
        size:{
            type:String
        },
    },{timestamps:true}]
},{timestamps:true})


const cart = mongoose.model('cart',cartschema)
module.exports= cart;