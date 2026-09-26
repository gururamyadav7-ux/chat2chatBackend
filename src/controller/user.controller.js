const User = require("../model/User.model");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/TokenCreate")

const Otp = require("../model/OTP.model");

const sendOtpEmail = require("../utils/SendOTP");



// ===============================
// Register User
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check email
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check phone
    const phoneExists = await User.findOne({ phone })

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete previous OTP
    await Otp.deleteMany({ email });

    // OTP expires after 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await Otp.create({
      email,
      otp,
      name,
      phone,
      password: hashedPassword,
      expiresAt,
    });

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Verification

const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "email and OTP are required",
      });
    }

    const otpData = await Otp.findOne({ email });



    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "email and OTP expired or not found",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }


    // Create user
    const user = await User.create({
      name: otpData.name,
      email: otpData.email,
      phone: otpData.phone,
      password: otpData.password,
      isVerified: true,
    });


    // Delete OTP
    await Otp.deleteOne({
      _id: otpData._id,
    });

    // Generate Access Token
    const accessToken = generateAccessToken(user._id);

    // Generate Refresh Token
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in database
    user.refreshToken = refreshToken;

    await user.save();


    // Cookie options
    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // Send cookies
    res
      .cookie(
        "accessToken",
        accessToken,
        accessTokenOptions
      )
      .cookie(
        "refreshToken",
        refreshToken,
        refreshTokenOptions
      )
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profilePic: user.profilePic,
        },
        accessToken: accessToken
      });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ===============================
// Login User
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update status
    user.status = "online";
    user.lastSeen = null;

    await user.save();

    // Generate Access Token
    const accessToken = generateAccessToken(user._id);

    // Generate Refresh Token
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in database
    user.refreshToken = refreshToken;

    await user.save();


    // Cookie options
    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    // Send cookies
    res
      .cookie(
        "accessToken",
        accessToken,
        accessTokenOptions
      )
      .cookie(
        "refreshToken",
        refreshToken,
        refreshTokenOptions
      )
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profilePic: user.profilePic,
        },
        accessToken: accessToken
      });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ===============================
// Get My Profile
// ===============================
const getMyProfile = async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Users
// ===============================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.userId,
      },
    }).select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Search Users
// ===============================
const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      _id: {
        $ne: req.user._id,
      },

      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Profile
// ===============================
const updateProfile = async (req, res) => {
  try {
    const { name, about, profilePic } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (about) {
      user.about = about;
    }

    if (profilePic) {
      user.profilePic = profilePic;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Logout
// ===============================
const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      status: "offline",
      lastSeen: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  verifyRegisterOtp,
  loginUser,
  getMyProfile,
  getAllUsers,
  searchUsers,
  updateProfile,
  logoutUser,
};
