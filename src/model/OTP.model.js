const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
        },

        otp: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically delete OTP after expiresAt
otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("Otp", otpSchema);