const express = require("express");
const { authMiddleware } = require("../middleware/middleware");
const {
  registerUser,
  verifyRegisterOtp,
  loginUser,
  verifyLoginOtp,
  getMyProfile,
  getAllUsers,
  searchUsers,
  updateProfile,
  logoutUser,
} = require("../controller/user.controller");

const router = express.Router();

//register user
router.post("/register", registerUser);
// register verify OTP
router.post("/verify-register-otp", verifyRegisterOtp);
// login user
router.post("/login", loginUser);
// Ligin verify OTP
router.post("/verify-login-otp", verifyLoginOtp);
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
