const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        isGroupChat: {
            type: Boolean,
            default: false,
        },

        groupName: {
            type: String,
            trim: true,
            default: "",
        },

        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        groupProfilePic: {
            type: String,
            default: "",
        },

        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Chat", chatSchema);