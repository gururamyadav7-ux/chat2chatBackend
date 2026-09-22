const onlineUsers = new Map();

const setupCallSocket = (io) => {
    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId;

        if (!userId) {
            socket.disconnect();
            return;
        }

        console.log(
            "Socket connected:",
            userId,
            socket.id
        );

        // ======================================
        // USER ONLINE
        // ======================================

        onlineUsers.set(
            String(userId),
            socket.id
        );

        socket.join(`user:${userId}`);

        io.emit("user:online", {
            userId,
        });

        // ======================================
        // CALL USER
        // ======================================

        socket.on(
            "call:user",
            ({
                callId,
                callerId,
                receiverId,
                caller,
                type,
            }) => {
                io.to(`user:${receiverId}`).emit(
                    "call:incoming",
                    {
                        callId,
                        callerId,
                        receiverId,
                        caller,
                        type,
                    }
                );
            }
        );

        // ======================================
        // CALL ACCEPT
        // ======================================

        socket.on(
            "call:accepted",
            ({
                callId,
                callerId,
                receiverId,
            }) => {
                io.to(`user:${callerId}`).emit(
                    "call:accepted",
                    {
                        callId,
                        callerId,
                        receiverId,
                    }
                );
            }
        );

        // ======================================
        // CALL REJECT
        // ======================================

        socket.on(
            "call:rejected",
            ({
                callId,
                callerId,
                receiverId,
            }) => {
                io.to(`user:${callerId}`).emit(
                    "call:rejected",
                    {
                        callId,
                        callerId,
                        receiverId,
                    }
                );
            }
        );

        // ======================================
        // CALL END
        // ======================================

        socket.on(
            "call:ended",
            ({
                callId,
                callerId,
                receiverId,
            }) => {
                const target =
                    String(userId) === String(callerId)
                        ? receiverId
                        : callerId;

                io.to(`user:${target}`).emit(
                    "call:ended",
                    {
                        callId,
                        callerId,
                        receiverId,
                    }
                );
            }
        );

        // ======================================
        // WEBRTC OFFER
        // ======================================

        socket.on(
            "webrtc:offer",
            ({
                targetUserId,
                offer,
                callId,
            }) => {
                io.to(`user:${targetUserId}`).emit(
                    "webrtc:offer",
                    {
                        offer,
                        callId,
                        fromUserId: userId,
                    }
                );
            }
        );

        // ======================================
        // WEBRTC ANSWER
        // ======================================

        socket.on(
            "webrtc:answer",
            ({
                targetUserId,
                answer,
                callId,
            }) => {
                io.to(`user:${targetUserId}`).emit(
                    "webrtc:answer",
                    {
                        answer,
                        callId,
                        fromUserId: userId,
                    }
                );
            }
        );

        // ======================================
        // ICE CANDIDATE
        // ======================================

        socket.on(
            "webrtc:ice-candidate",
            ({
                targetUserId,
                candidate,
                callId,
            }) => {
                io.to(`user:${targetUserId}`).emit(
                    "webrtc:ice-candidate",
                    {
                        candidate,
                        callId,
                        fromUserId: userId,
                    }
                );
            }
        );

        // ======================================
        // MUTE
        // ======================================

        socket.on(
            "call:mute",
            ({
                targetUserId,
                muted,
            }) => {
                io.to(`user:${targetUserId}`).emit(
                    "call:remote-mute",
                    {
                        muted,
                    }
                );
            }
        );

        // ======================================
        // CAMERA
        // ======================================

        socket.on(
            "call:camera",
            ({
                targetUserId,
                enabled,
            }) => {
                io.to(`user:${targetUserId}`).emit(
                    "call:remote-camera",
                    {
                        enabled,
                    }
                );
            }
        );

        // ======================================
        // DISCONNECT
        // ======================================

        socket.on("disconnect", () => {
            onlineUsers.delete(
                String(userId)
            );

            io.emit("user:offline", {
                userId,
            });

            console.log(
                "Socket disconnected:",
                userId
            );
        });
    });
};

module.exports = {
    setupCallSocket,
    onlineUsers,
};