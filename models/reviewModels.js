const mongoose = require('mongoose') 

const reviewSchema= new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product'
     },
     Rating:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
            rating:{
                type:String,
                require:true
            },
            Title:{
                type:String
            },
            review:{
                type:String
            },}]
        },{timestamps:true})

const review =mongoose.model('review',reviewSchema)  
module.exports= review;    

