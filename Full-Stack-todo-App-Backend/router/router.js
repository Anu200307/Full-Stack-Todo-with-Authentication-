const express = require("express");
const router = express.Router();

const {signup,login,loggedInTime} = require("../controller/userController");
const {auth,isUser, isAdmin} = require("../middlewire/auth");
const { createTodo,getAllTodos,deleteTodo,updateTodo ,checkedMark,unCheckMark} = require("../controller/todoController");
const {totalTodo,totalUser,adminDetails,allUsersDetails,addAdmin} = require("../controller/adminController");
const {role} = require("../validateRole");
const {totalTrackingUser} = require("../controller/userTrackingController");


router.post("/signup",signup);
router.post("/login",login);
router.post("/checked", auth, isUser, checkedMark);
router.post("/uncheck",auth,isUser,unCheckMark);
router.post("/create",auth,isUser,createTodo);
router.get("/loggedin",auth,loggedInTime);
router.get("/alltodos",auth,isUser,getAllTodos);
router.delete("/delete", auth, isUser, deleteTodo);
router.put("/update",auth,isUser,updateTodo);
router.get("/admin/totaltodo",auth,isAdmin,totalTodo);
router.get("/admin/totaluser",auth,isAdmin,totalUser);
router.get("/admin/details",auth,isAdmin,adminDetails);
router.post("/admin/addadmin",auth,isAdmin,addAdmin);
router.get("/admin/traffic",auth,isAdmin,totalTrackingUser);
router.get("/admin/allusers",auth,isAdmin,allUsersDetails);
router.get("/role",role);
module.exports = router;