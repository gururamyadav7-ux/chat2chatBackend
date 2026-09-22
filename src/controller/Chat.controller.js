// controllers/chatController.js

const Chat = require("../model/chat.model");

const accessChat = async (req, res) => {
    try {
        const userId = req.body;
        const loggedInUserId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        if (loggedInUserId.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot chat with yourself"
            });
        }

        // Check existing chat
        let chat = await Chat.findOne({
            isGroupChat: false,
            participants: {
                $all: [loggedInUserId, userId]
            }
        })
            .populate("participants", "name email profilePic")
            .populate("latestMessage");

        // Agar chat already exist hai
        if (chat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                chat
            });
        }

        // New chat
        chat = await Chat.create({
            participants: [
                loggedInUserId,
                userId
            ],
            isGroupChat: false
        });

        chat = await Chat.findById(chat._id)
            .populate("participants", "name email profilePic")
            .populate("lastMessage");

        return res.status(201).json({
            success: true,
            message: "Chat created",
            chat
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { accessChat }