const express = require("express");

const router = express.Router();

const { authMiddleware } = require("../middleware/middleware");

const {
    createCall,
    acceptCall,
    rejectCall,
    endCall,
    getCallHistory,
} = require("../controller/Call.controller");

// Create
router.post(
    "/",
    authMiddleware,
    createCall
);

// Accept
router.put(
    "/:callId/accept",
    authMiddleware,
    acceptCall
);

// Reject
router.put(
    "/:callId/reject",
    authMiddleware,
    rejectCall
);

// End
router.put(
    "/:callId/end",
    authMiddleware,
    endCall
);

// History
router.get(
    "/history",
    authMiddleware,
    getCallHistory
);

module.exports = router;