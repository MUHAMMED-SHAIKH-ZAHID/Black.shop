const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const adminschema= new Schema({ 
    name:{
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
    }
},{timestamps:true})

const admin = mongoose.model('admin',adminschema)
module.exports=admin;