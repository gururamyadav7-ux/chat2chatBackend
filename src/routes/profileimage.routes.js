const express = require("express");
const router = express.Router();

// ==========================================
// imagekite upload
// ==========================================
const upload = require("../middleware/imagekiteMW");
//==========================================
// PROFILE IMAGE CONTROLLER
//==========================================
const { updateProfile } = require("../controller/imagekite.controller");
// ==========================================
// authMiddleware
// ==========================================
const { authMiddleware } = require("../middleware/middleware");
// ==========================================
// PROFILE IMAGE ROUTES
// ==========================================
router.put("/upload", authMiddleware, upload.single("image"), updateProfile);

module.exports = router;
