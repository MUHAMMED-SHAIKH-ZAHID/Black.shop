const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userschema= new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
        
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:true
    },
    userimg:{
        type:Array
    },
    DOB:{
        type:String
    },
    alternatemobile:{
        type:String
    }
},{timestamps:true})

const user = mongoose.model('user',userschema)
module.exports=user;