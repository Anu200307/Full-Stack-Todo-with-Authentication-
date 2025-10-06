const User = require("../model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if(!token)
        {
            return res.status(500).json({message:"Token not get"});
        }
        else{
            try {
                const decode =  jwt.verify(token,process.env.SECRET_KEY);
                req.user = decode.email;
                next();
            } catch (error) {
                return res.status(500).json({message:"Invalid auth"});
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({message:"Please login again"});
    }
}

exports.isUser = async(req,res,next) =>{
    try {
        const email = req.user;
        const userExist = await User.findOne({email});
        if(!userExist)
        {
            return res.status(401).json({message:"User not found"});
        }
        else{
            const role = userExist.role;
            if(role == "User")
            {
                next();
;                
            }
            else{
                return res.status(401).json({message:"It is user route"});
            }
           
             
        }

    } catch (error) {
        console.log(error);
        return res.status(401).json({message:"Internal server error"});
    }
}




exports.isAdmin = async(req,res,next) =>{
    try {
        const email = req.user;
        const userExist = await User.findOne({email});
        if(!userExist)
        {
            return res.status(401).json({message:"User not found"});
        }
        else{
            const role = userExist.role;
            if(role == "Admin")
            { 
                next();
            }
            else{
                
                return res.status(401).json({message:"It is Admin route"});
            }
           
             
        }

    } catch (error) {
        console.log(error);
        return res.status(401).json({message:"Internal server error"});
    }
}