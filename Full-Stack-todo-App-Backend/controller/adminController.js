const Todo = require("../model/Todo");
const User = require("../model/User");
const { role } = require("../validateRole");
const { success, z } = require("zod");
const bcrypt = require("bcrypt");

exports.totalTodo = async (req, res) => {
    try {
        const count = await Todo.countDocuments({});
        return res.status(200).json({ count: count });
    } catch (error) {
        console.log(error);
    }
}


exports.totalUser = async (req, res) => {
    try {
        const count = await User.countDocuments({});
        return res.status(200).json({ count: count });
    } catch (error) {
        console.log(error);
    }
}



exports.adminDetails = async(req,res)=>{
    try {
        const email = req.user;
        const UserDetails = await User.findOne({email});
        const admin = {
            username : UserDetails.username,
            email : UserDetails.email
        }
        return res.status(200).json({message:admin});
    } catch (error) {
        console.log(error);
    }

}

exports.allUsersDetails = async(req,res)=>{
    try {
        const allUsers = await User.find({});
        res.status(200).json({message:allUsers});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}

exports.addAdmin = async (req, res) => {
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
            const user = new User({ email, username, password: hashPassword , role:"Admin" });
            await user.save();

            return res.status(201).json({ success: true, message: "User Created Successfully"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }

};