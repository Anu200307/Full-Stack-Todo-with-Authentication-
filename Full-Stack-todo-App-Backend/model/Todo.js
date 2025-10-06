const mongoose = require("mongoose");
const { check, boolean } = require("zod");

const Todo = mongoose.Schema({
    title:{
        type:String,
        require:true,
    },
    body:{
        type:String
    },
    date:{
        type:Date,
        default: Date.now(),
        require:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    complete:{
        type:Boolean,
        default:false
    }
});


module.exports = mongoose.model("todo",Todo);