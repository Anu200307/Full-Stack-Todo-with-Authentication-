const mongoose = require("mongoose");

const UserTracking = mongoose.Schema({
    ip:{
        type:String
    },
    email:{
        type:String
    },
    time:{
        type:Date,
        default:Date.now()
    }
});


module.exports = mongoose.model("userTracking",UserTracking);