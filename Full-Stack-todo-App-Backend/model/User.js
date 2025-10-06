const mongoose = require("mongoose");

const User = mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    username:{
        type:String
    },
    password:{
        type:String
    },
    todos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"todo"
        }
    ],
    role:{
        type:String,
        enum:["User","Admin"],
        default:"User"
    },
    loginInTime :{
        type:Date,
        default : Date.now
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});


module.exports = mongoose.model("user",User);