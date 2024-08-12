const User = require("../models/User");
const Message = require("../models/Message");

module.exports = (io, socket) => {
  console.log("A user connected:", socket.user.username);

  socket.on("message", async ({ to, message }) => {
    try {
      const newMessage = new Message({ from: socket.user.username, to, message });
      await newMessage.save();
      io.emit("message", { from: socket.user.username, to, message });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("loadChat", async (username) => {
    try {
      const chatHistory = await Message.find({
        $or: [
          { from: socket.user.username, to: username },
          { from: username, to: socket.user.username },
        ],
      }).sort({ timestamp: 1 }).lean();
      socket.emit("chatHistory", chatHistory);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.user.username);
  });

  // Send the list of users to the client
  User.find({}, "username")
    .lean()
    .then((users) => socket.emit("users", users.map((user) => user.username)))
    .catch((error) => console.error("Error fetching users:", error));
};
