const { _min } = require("zod/v4/core");
const User = require("../model/User")
const { z, email, success } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userTracking = require("../model/UserTracking");

const express = require("express");
const app = express();
app.set('trust proxy', true);


exports.signup = async (req, res) => {
    const signupValidation = z.object(
        {
            email: z.string().email({ message: "Inavlid email" }),
            password: z.string().min(8, { message: "please enter 8 digit password" }),
            username: z.string().min(1, { message: "Please enter username" })
        });
    try {
        const validationResult = signupValidation.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(500).json({ error: validationResult.error.issues[0].message });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }

    const { email, username, password } = req.body;

    if (!username || !email || !password) {
        return res.status(500).send("Please fill properly");
    }

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(500).json({ success: false, message: "user already exist" });
        }
        else {
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({ email, username, password: hashPassword,createdAt:Date.now()});
            await user.save();

            return res.status(201).json({ success: true, message: "User Created Successfully"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

exports.login = async (req, res) => {

    const loginValidation = z.object(
        {
            email: z.string().email({ message: "Inavlid email" }),
            password: z.string().min(8, { message: "please enter 8 digit password" }),
        });

    try {
        const validationResult = loginValidation.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(500).json({ error: validationResult.error.issues[0].message });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Validation error " });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(500).send("Please fill properly");
        }

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(500).json({ success: false, message: "user not exist" });
        }
        else {
            const dbPassword = userExist.password;
            let isMatchPassword = await bcrypt.compare(password, dbPassword);
            console.log(isMatchPassword)
            if (!isMatchPassword) {
                return res.status(401).json({ message: "Please enter valid password" });
            }
            else {
                const payload = {
                    email: userExist.email,
                    username: userExist.username
                };

                let token = await jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 60 * 60 });

                const isProduction = req.headers.origin?.includes("vercel.app");

                const cookiesOption = {
                  httpOnly: true,
                  secure: isProduction,  
                  sameSite: "None",
                  sameSite: isProduction ? "None" : "Lax", // None for cross-origin
                  maxAge: 60 * 60 * 1000,
            };

                const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
                console.log("Client IP:", ip);
                
                const Tracking = new userTracking({ip:ip,email:userExist.email});
                await Tracking.save();
                res.cookie("token", token, cookiesOption).status(200).json({ success: true, message: "Login successfully..", token:token });
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }

}


exports.loggedInTime = async(req,res)=>{
    try {
       const email = req.user;
        const user = await User.findOne({email});
        await User.findByIdAndUpdate(user._id,{loginInTime:Date.now()});
        return res.status(200).json({success:true})
    } catch (error) {
        console.log(error);
    }
};
