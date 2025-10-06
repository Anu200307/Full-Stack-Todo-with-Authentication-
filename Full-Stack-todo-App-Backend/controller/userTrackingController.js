const { email } = require("zod");
const userTracking = require("../model/UserTracking");
const User = require("../model/User");

exports.totalTrackingUser = async (req, res) => {
    const now = new Date();

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    try {
        const last1Hour = await userTracking.countDocuments({ time: { $gte: oneHourAgo } });
        const last1Day = await userTracking.countDocuments({ time: { $gte: oneDayAgo } });
        const last7Days = await userTracking.countDocuments({ time: { $gte: sevenDaysAgo } });
        const last30Days = await userTracking.countDocuments({ time: { $gte: thirtyDaysAgo } });

        res.json({
            last1Hour,
            last1Day,
            last7Days,
            last30Days
        });
    } catch (error) {
        console.error("Traffic fetch error:", error);
        res.status(500).json({ message: "Error fetching traffic data" });
    }
};


exports.makeadmin = async (req,res)=>{
    try {
        const {email} = req.body;
        const userExist = await User.findOne({email});
        if(!userExist)
        {
            return res.status(400).json({message:"Unser not exist"});
        }
        else{
            const role = userExist.role;
            if(role === 'User')
            {
                // await User.findOneAndUpdate
            }
        }
    } catch (error) {
        
    }
}
