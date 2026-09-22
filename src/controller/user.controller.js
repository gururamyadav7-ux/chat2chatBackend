const User = require("../model/User.model");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken } = require("../utils/TokenCreate")

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

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
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
  loginUser,
  getMyProfile,
  getAllUsers,
  searchUsers,
  updateProfile,
  logoutUser,
};
