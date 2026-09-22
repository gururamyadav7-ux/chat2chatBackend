const express = require("express");

const router = express.Router();

const {
    getAllChats,
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
} = require("../controller/message.controller");

const { authMiddleware } = require("../middleware/middleware");


// ==========================================
// MESSAGE ROUTES
// ==========================================

// ==========================================
// GET ALL CHATS
// ==========================================
router.get(
    "/message/chats",
    authMiddleware,
    getAllChats
);

// ==========================================
// GET PARTICULAR CHAT MESSAGES
// ==========================================
router.get(
    "/message/:chatId",
    authMiddleware,
    getMessages
);

// ==========================================
// SEND MESSAGE
// ==========================================
router.post(
    "/message",
    authMiddleware,
    sendMessage
);

// ==========================================
// EDIT MESSAGE
// ==========================================
router.put(
    "/message/:messageId",

    authMiddleware,
    updateMessage
);

// ==========================================
// DELETE MESSAGE
// ==========================================
router.delete(
    "/message/:messageId",
    authMiddleware,
    deleteMessage
);


module.exports = router;