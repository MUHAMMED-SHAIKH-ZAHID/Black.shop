const mongoose=require('mongoose')

const bannerSchema= new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
    },
    title:{
        type:String
    },  
    subTitle:{
        type:String
    },
    bannerimg:{
        type:Array
    }
})

const banner= mongoose.model('banner',bannerSchema)
module.exports=banner;