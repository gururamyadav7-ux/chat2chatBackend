const Call = require("../model/Call.model");

// ==========================================
// CREATE CALL
// ==========================================

const createCall = async (req, res) => {
    try {
        const { receiverId, type } = req.body;

        if (!receiverId || !type) {
            return res.status(400).json({
                success: false,
                message: "receiverId and type are required",
            });
        }

        const call = await Call.create({
            caller: req.user._id,
            receiver: receiverId,
            type,
            status: "calling",
        });

        return res.status(201).json({
            success: true,
            call,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Call creation failed",
        });
    }
};

// ==========================================
// ACCEPT CALL
// ==========================================

const acceptCall = async (req, res) => {
    try {
        const { callId } = req.params;

        const call = await Call.findByIdAndUpdate(
            callId,
            {
                status: "accepted",
                startedAt: new Date(),
            },
            {
                new: true,
            }
        );

        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call not found",
            });
        }

        return res.json({
            success: true,
            call,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Accept call failed",
        });
    }
};

// ==========================================
// REJECT CALL
// ==========================================

const rejectCall = async (req, res) => {
    try {
        const { callId } = req.params;

        const call = await Call.findByIdAndUpdate(
            callId,
            {
                status: "rejected",
                endedAt: new Date(),
            },
            {
                new: true,
            }
        );

        return res.json({
            success: true,
            call,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Reject call failed",
        });
    }
};

// ==========================================
// END CALL
// ==========================================

const endCall = async (req, res) => {
    try {
        const { callId } = req.params;

        const call = await Call.findById(callId);

        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call not found",
            });
        }

        const endedAt = new Date();

        let duration = 0;

        if (call.startedAt) {
            duration = Math.floor(
                (endedAt - call.startedAt) / 1000
            );
        }

        call.status = "ended";
        call.endedAt = endedAt;
        call.duration = duration;

        await call.save();

        return res.json({
            success: true,
            call,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "End call failed",
        });
    }
};

// ==========================================
// CALL HISTORY
// ==========================================

const getCallHistory = async (req, res) => {
    try {
        const calls = await Call.find({
            $or: [
                {
                    caller: req.user._id,
                },
                {
                    receiver: req.user._id,
                },
            ],
        })
            .populate("caller", "name profilePic")
            .populate("receiver", "name profilePic")
            .sort({
                createdAt: -1,
            });

        return res.json({
            success: true,
            calls,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Call history failed",
        });
    }
};

module.exports = {
    createCall,
    acceptCall,
    rejectCall,
    endCall,
    getCallHistory,
};