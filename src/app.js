const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
require("dotenv").config();

const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// ======================================
// Socket.io
// ======================================
const { Server } = require("socket.io");
// ======================================
// User Controller
// ======================================
const userController = require("./routes/user.routes");
// ======================================
// Refresh Token Controller
// ======================================
const refreshToken = require("..//src/routes/refreshTken.routes");
// ======================================
// Profile Image Controller
// ======================================
const profileImage = require("../src/routes/profileimage.routes");

// chat controller

const chatController = require("../src/routes/Chat.routes")

// soket io Server

const { initSocket } = require("../src/ChateSarver/socket")
// ======================================
// Message Controller
// ======================================
const messageController = require("../src/routes/message.routes");
// Call route
const callRoutes = require("../src/routes/Call.routes");

const app = express();

// JSON data ke liye
app.use(express.json());
app.use(cookieParser());
//CORS
const allowedOrigins = [
  process.env.CLIENT_LOCAL_URL,
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ======================================
// Server setup
// ======================================
const server = http.createServer(app);
// ==========================================
// SOCKET
// ==========================================
const io = new Server(server,
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

initSocket(io)
// chat socket

// ======================================
// Routes setup
// ======================================

app.use("/api/user", userController);
app.use("/api/user", refreshToken);
app.use("/api/user", profileImage);

/*
http://localhost:4000/api/user/register
http://localhost:4000/api/user/login
http://localhost:4000/api/user/profile
http://localhost:4000/api/user/allusers
http://localhost:4000/api/user/searchusers
http://localhost:4000/api/user/updateprofile
http://localhost:4000/api/user/logoutuser
*/

// ======================================
// Message Routes setup
// ======================================

app.use("/api", messageController);

app.use("/api", chatController)

/*
http://localhost:4000/api/message/chats
http://localhost:4000/api/message/:chatId
http://localhost:4000/api/message/:messageId
http://localhost:4000/api/message/seen/:messageId
*/

// ======================================
// Call controller route
// ======================================

app.use("/api/call", callRoutes);

module.exports = server;
