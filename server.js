require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { connectDB } = require("./config/db");
const socketHandler = require("./controllers/socketController");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/messages", require("./routes/messageRoutes"));

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Message Server</h1>");
});

// Socket.io connection handling
io.use(require("./middlewares/authenticate"));
io.on("connection", (socket) => socketHandler(io, socket));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
