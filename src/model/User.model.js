// User schema
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    // Name field with validation
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // Email field with validation
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid Email Address",
      ],
    },
    // Phone number field with validation
    phone: {
      type: String,
      required: [true, "phone number is required"],
      unique: true,
      sparse: true,
      trim: true,
    },
    // Password field with validation
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,

    },
    // Profile picture URL
    profilePic: {
      type: String,
      default: ""
    },

    // About me
    about: {
      type: String,
      default: "Hey there! I am using WhatsApp.",
    },
    // Online status
    isOnline: {
      type: Boolean,
      default: false,
    },
    // Last seen timestamp
    lastSeen: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    // socketId for real-time communication
    socketId: {
      type: String,
      default: null,
    },
    // Refresh token for authentication
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare login password to hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
