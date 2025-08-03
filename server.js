const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Utils and DB
const { syncAllExistingUsers } = require("./services/utils/syncUsers.js");
const { sequelize, testConnection } = require("./services/database/postgres/postgres-database.js");
const Messages = require("./services/database/postgres/models/messageModel.js");

// Express app setup
const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_APPLICATION_DOMAIN,
      "http://localhost:3000",
      "https://student-portal-xi-two.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔌 Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, socket.handshake.query);

  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  }

  socket.on("sendNotification", ({ senderId, receiverId, type, message }) => {
    io.to(receiverId).emit("getNotification", {
      senderId,
      type,
      message,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on("sendMessage", (msg) => {
    io.to(msg.recipientId).emit("newMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


// Middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      process.env.FRONTEND_APPLICATION_DOMAIN,
      "http://localhost:3000",
      "https://student-portal-xi-two.vercel.app"
    ],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["sessionId", "Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// Sync messages table
Messages.sync();

// Start database and user sync
async function startServer() {
  await sequelize.sync();
  await syncAllExistingUsers();
}

// Routers
app.use("/admin", require("./routers/admin-router.js"));
app.use("/token", require("./routers/token-router.js"));
app.use("/user-account-verification", require("./routers/user-account-verification-router.js"));
app.use("/authenticator", require("./routers/user-authenticator-router.js"));
app.use("/technical-mentor", require("./routers/user-routers/technical-mentor-router.js"));
app.use("/career-coach", require("./routers/user-routers/career-coach-router.js"));
app.use("/facilitator", require("./routers/user-routers/facilitator-router.js"));
app.use("/messages", require("./routers/message-router.js"));
app.use("/conversations", require("./routers/conversation-router.js"));
app.use("/attendance", require("./routers/attendanceRoutes.js"));
app.use("/leave", require("./routers/leaveRoutes.js"));
app.use("/assignments", require("./routers/assignmentRoutes.js"));
app.use("/api/events", require("./routers/eventRoutes"));
app.use("/calendar", require("./routers/calender-router.js"));
app.use("/cohorts", require("./routers/cohorts"));
app.use("/reviews", require("./routers/traineeReviewRouter"));
app.use("/", require("./routers/avatar-router.js"));
app.use("/", require("./routers/oauth"));
app.use(require("./routers/users-router.js"));

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    message: "CORS is working properly",
    allowedOrigins: [
      process.env.FRONTEND_APPLICATION_DOMAIN,
      "http://localhost:3000",
      "https://student-portal-xi-two.vercel.app"
    ],
    currentOrigin: req.get("origin"),
  });
});

// Start server
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server listening on port: ${PORT}`);
  testConnection();
});

module.exports = { app, server, io };
