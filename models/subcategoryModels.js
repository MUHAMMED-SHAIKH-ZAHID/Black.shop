const mongoose = require('mongoose')
const Schema= mongoose.Schema

const subcategoryschema=new Schema({
    subCategoryName:{
        type:String,
        required:true,
    },
    Category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
    }

},{timestamps:true})

const subCategory = mongoose.model('subCategory',subcategoryschema)
module.exports=subCategory;
