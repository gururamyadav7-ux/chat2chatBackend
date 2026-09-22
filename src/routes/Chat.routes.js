const express = require("express");

const router = express.Router();

const {
    accessChat
} = require("../controller/Chat.controller");

const { authMiddleware } = require("../middleware/middleware");


// ==========================================
// MESSAGE ROUTES
// ==========================================
// ===============================
// Create / Access One-to-One Chat
// ===============================

router.get(
    "/accseschat",
    authMiddleware,
    accessChat
);
module.exports = router;