const User = require("./model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.role = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
            try {
                const decode =  jwt.verify(token,process.env.SECRET_KEY);
                const email = decode.email;
                const userExist = await User.findOne({email});
                return res.status(200).json({role:userExist.role});
            } catch (error) {
                return res.status(500).json({message:"Invalid auth"});
            }
        }catch (error) {
        console.log(error);
        return res.status(401).json({message:"Please login again"});
    }
}

