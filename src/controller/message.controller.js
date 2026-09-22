
const Message = require("../model/message.model");
const Chat = require("../model/chat.model");


// ==========================================
// GET ALL CHATS
// ==========================================

const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
        })
            .populate("participants", "name profilePic")
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "name profilePic",
                },
            })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: chats.length,
            chats,
        });
    } catch (error) {
        console.error("Get All Chats Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// GET PARTICULAR CHAT MESSAGES
// ==========================================

const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        // ==========================================
        // CHECK CHAT EXISTS AND USER IS PARTICIPANT
        // ==========================================

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or you are not a participant",
            });
        }

        // ==========================================
        // GET MESSAGES
        // ==========================================

        const messages = await Message.find({
            chat: chatId,
        })
            .populate("sender", "name profilePic")
            .populate("chat")
            .sort({ createdAt: 1 });

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,
            count: messages.length,
            messages,
        });

    } catch (error) {
        console.error("Get Messages Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// SEND MESSAGE
// ==========================================

const sendMessage = async (req, res) => {
    try {
        const { chatId, message, sender, receiverId } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const newMessage = await Message.create({
            chatId,
            sender,
            receiverId,
            message,
        });
        res.status(201).json({
            success: true,
            message: newMessage,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// EDIT MESSAGE
// ==========================================

const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { message },
            { new: true }
        ).populate("sender", "name profilePic");

        res.status(200).json({
            success: true,
            message: updatedMessage,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// DELETE MESSAGE
// ==========================================

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getAllChats,
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
};
