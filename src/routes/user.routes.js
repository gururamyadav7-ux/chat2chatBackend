const express = require("express");
const { authMiddleware } = require("../middleware/middleware");
const {
  registerUser,
  loginUser,
  getMyProfile,
  getAllUsers,
  searchUsers,
  updateProfile,
  logoutUser,
} = require("../controller/user.controller");

const router = express.Router();

//register user
router.post("/register", registerUser);
// login user
router.post("/login", loginUser);
// my profile
router.get("/profile", authMiddleware, getMyProfile);
// all users
router.get("/allusers", authMiddleware, getAllUsers);
// search user
router.get("/searchusers", authMiddleware, searchUsers);
//update profile
router.put("/updateprofile", authMiddleware, updateProfile);
// logout user
router.get("/logoutuser", authMiddleware, logoutUser);

module.exports = router;
