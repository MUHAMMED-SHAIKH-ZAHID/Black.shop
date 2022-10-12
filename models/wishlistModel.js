const mongoose = require('mongoose')

const wishlistSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product'
        }
    }]
},{timestamps:true})

const wishlist = mongoose.model('wishlist',wishlistSchema)
module.exports=wishlist;