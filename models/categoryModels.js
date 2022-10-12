const mongoose = require ('mongoose')
const Schema =mongoose.Schema;

const categoryscheama= new Schema({
    categoryname:{
        type:String,
        required:true,
    },
    CategoryName:{
        type:String,
        required:true
    },
    Categoryimg:{
        type:Array,
    }
},{timestamps:true})

const category = mongoose.model('category',categoryscheama)
module.exports=category;