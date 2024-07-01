const mongoose = require('mongoose');



const postSchema=mongoose.Schema({
 user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
 },
 content:{
    type:String
 },
 likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
 }]
},{timestamps:true});

module.exports=mongoose.model('post',postSchema);