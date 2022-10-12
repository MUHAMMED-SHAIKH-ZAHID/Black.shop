const { ObjectID } = require('bson')
const mongoose=require('mongoose')

const AddressSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    Name:{
        type:String,
        require:true
    },
    mobile:{
        type:String,
        require:true
    },
    Address1:{
        type:String,
        require:true
    },
    landmark:{
        type:String,
    },
    pincode:{
        type:String,
        require:true
    },
    City:{
        type:String
    },
    District:{
        type:String,
        require:true
    },
    State:{
        type:String,
        require:true
    },
    Type:{
        type:String,
        require:true
    },
    defaultAddress:{
        type:Boolean
    }

})

const Address=mongoose.model('Address',AddressSchema)
module.exports=Address;