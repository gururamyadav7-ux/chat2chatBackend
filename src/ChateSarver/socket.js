
const onlineUsers = new Map();
const initSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`socket connect : ${socket.id}`)
        // =====================================
        // 1. REGISTER USER
        // =====================================
        socket.on("register", (userId) => {
            console.log(`SenderUserid : ${userId}`)
            if (!userId) {
                console.log("UserId nahi mila");

                socket.disconnect();
                return;
            }

            // UserId -> SocketId
            onlineUsers.set(userId.toString(), socket.id);

            // socket ke andar bhi save
            socket.userId = userId.toString();

            console.log(
                "User registered:",
                userId,
                "Socket:",
                socket.id
            );

            // Sabhi online users frontend ko bhejo
            io.emit(
                "onlineUsers",
                Array.from(onlineUsers.keys())
            );
        })

        socket.on("sendmessage", (data) => {
            socket.broadcast.emit("resivmessage", data)
        })



        // =====================================
        // 2. SEND MESSAGE
        // =====================================

        // socket.on("sendMessage", (data) => {
        //     const {
        //         senderId,
        //         receiverId,
        //         message,
        //         chatId,
        //     } = data;

        //     if (!senderId || !receiverId || !message) {
        //         return;
        //     }

        //     const receiverSocketId =
        //         onlineUsers.get(receiverId.toString());

        //     const messageData = {
        //         senderId,
        //         receiverId,
        //         message,
        //         chatId,
        //         createdAt: new Date(),
        //     };

        //     // Receiver online hai
        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit(
        //             "receiveMessage",
        //             messageData
        //         );
        //     }

        //     // Sender ko confirmation
        //     socket.emit("messageSent", messageData);
        // });

        // =====================================
        // 3. TYPING
        // =====================================

        // socket.on("typing", (data) => {
        //     const {
        //         senderId,
        //         receiverId,
        //         chatId,
        //     } = data;

        //     const receiverSocketId =
        //         onlineUsers.get(receiverId.toString());

        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit("userTyping", {
        //             senderId,
        //             chatId,
        //         });
        //     }
        // });

        // =====================================
        // 4. STOP TYPING
        // =====================================

        // socket.on("stopTyping", (data) => {
        //     const {
        //         senderId,
        //         receiverId,
        //         chatId,
        //     } = data;

        //     const receiverSocketId =
        //         onlineUsers.get(receiverId.toString());

        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit("userStopTyping", {
        //             senderId,
        //             chatId,
        //         });
        //     }
        // });

        // =====================================
        // 5. MESSAGE SEEN
        // =====================================

        // socket.on("seen", (data) => {
        //     const {
        //         messageId,
        //         senderId,
        //         receiverId,
        //         chatId,
        //     } = data;

        //     const senderSocketId =
        //         onlineUsers.get(senderId.toString());

        //     if (senderSocketId) {
        //         io.to(senderSocketId).emit("messageSeen", {
        //             messageId,
        //             receiverId,
        //             chatId,
        //         });
        //     }
        // });

        // =====================================
        // 6. CALL
        // =====================================

        // socket.on("call", (data) => {
        //     const {
        //         callerId,
        //         receiverId,
        //         callType,
        //         offer,
        //     } = data;

        //     const receiverSocketId =
        //         onlineUsers.get(receiverId.toString());

        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit("incomingCall", {
        //             callerId,
        //             receiverId,
        //             callType,
        //             offer,
        //         });
        //     }
        // });

        // =====================================
        // 7. CALL ACCEPT
        // =====================================

        // socket.on("acceptCall", (data) => {
        //     const {
        //         callerId,
        //         receiverId,
        //         answer,
        //     } = data;

        //     const callerSocketId =
        //         onlineUsers.get(callerId.toString());

        //     if (callerSocketId) {
        //         io.to(callerSocketId).emit("callAccepted", {
        //             receiverId,
        //             answer,
        //         });
        //     }
        // });

        // =====================================
        // 8. CALL REJECT
        // =====================================

        // socket.on("rejectCall", (data) => {
        //     const {
        //         callerId,
        //         receiverId,
        //     } = data;

        //     const callerSocketId =
        //         onlineUsers.get(callerId.toString());

        //     if (callerSocketId) {
        //         io.to(callerSocketId).emit("callRejected", {
        //             receiverId,
        //         });
        //     }
        // });

        // =====================================
        // 9. END CALL
        // =====================================

        // socket.on("endCall", (data) => {
        //     const {
        //         receiverId,
        //     } = data;

        //     const receiverSocketId =
        //         onlineUsers.get(receiverId.toString());

        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit("callEnded");
        //     }
        // });

        // =====================================
        // 10. DISCONNECT
        // =====================================

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);

            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);

                    io.emit("userOffline", {
                        userId,
                    });

                    break;
                }
            }
        });
    });

    return io;
};

module.exports = {
    initSocket,
    onlineUsers,
};