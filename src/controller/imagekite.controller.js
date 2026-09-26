const ImageKit = require("imagekit");
const User = require("../../src/model/User.model");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, about } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Text update
    if (name) {
      user.name = name;
    }

    if (about) {
      user.about = about;
    }

    console.log(req.file);

    // Profile image update
    if (req.file) {
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: `profile_${userId}_${Date.now()}.jpg`,
        folder: "/whatsapp/profile",
      });

      user.profilePic = uploadResponse.url;
      user.profilePicFileId = uploadResponse.fileId;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        about: user.about,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

module.exports = {
  updateProfile,
};