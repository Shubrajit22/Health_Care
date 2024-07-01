const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test')

const userSchema=mongoose.Schema({
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
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ]
},{timestamps:true});

module.exports=mongoose.model('user',userSchema);