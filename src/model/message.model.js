const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        // Chat ID
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
        },

        // Sender ID
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Receiver ID
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Message content
        message: {
            type: String,
            trim: true,
            default: "",
        },
        // Message type (text, image, video, audio, file)
        messageType: {
            type: String,
            enum: ["text", "image", "video", "audio", "file"],
            default: "text",
        },
        // File URL for media messages
        fileUrl: {
            type: String,
            default: "",
        },
        // Delivery and read status
        deliveredTo: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                status: {
                    type: String, default: "set",
                },
                deliveredAt: {
                    type: Date
                }
            },
        ],
        // Seen by users
        seenBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Deleted for everyone and deleted for specific users
        deletedForEveryone: {
            type: Boolean,
            default: false,
        },

        // Users for whom the message is deleted
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Edited status
        isEdited: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;