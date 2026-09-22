const jwt = require("jsonwebtoken")
const User = require("../model/User.model")

const refreshAccessToken = async (req, res) => {
  try {

    const refreshToken =
      req.cookies.refreshToken;


    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }


    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );


    // Find user
    const user = await User.findById(decoded.id);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Check refresh token
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }


    // Generate new access token
    const newAccessToken =
      generateAccessToken(user._id);


    // Send new cookie
    res
      .cookie(
        "accessToken",
        newAccessToken,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
        }
      )
      .status(200)
      .json({
        success: true,
        message:
          "New access token generated",
      });

  } catch (error) {

    return res.status(401).json({
      success: false,
      message:
        "Refresh token expired or invalid",
    });

  }
};

module.exports = { refreshAccessToken }