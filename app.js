const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const port = process.env.PORT || 3000
const formatMessage = require("./utils/message");
require("dotenv/config");
const botName = "Nomad bot";
const mongoose = require("mongoose");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/user");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//Database config

io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    console.log(username);
    const user = userJoin(socket.id, username, room);
    console.log(user.username);
    socket.join(user.room);

    socket.emit("message", formatMessage(botName, "Welcome to ChatCord"));

    //Broadcast when a user has join
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has join the chat`)
      );

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //listen for changemessages
  socket.on("replies", msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //Broadcast when a user disconnect to all the users except the client
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

http.listen(port, () => {
  console.log("io online");
});
