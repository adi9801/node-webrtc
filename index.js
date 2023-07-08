const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");
const socket = require("socket.io");

const server = app.listen(3000, () => {
  console.log("Server is running..");
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use("/", userRoute);

// socket connection with signaling server
var io = socket(server);

io.on("connection", function (socket) {
  console.log("user connected: " + socket.id);

  socket.on("join", function (roomName) {
    var rooms = io.sockets.adapter.rooms;
    var room = rooms.get(roomName);
    if (room == undefined) {
      socket.join(roomName);
      socket.emit("created");
      // console.log("room created");
    } else if (room.size == 1) {
      socket.join(roomName);
      socket.emit("joined");
      // console.log("room joined");
    } else {
      socket.emit("full");
      // console.log("room is full now");
    }
    console.log("room", rooms);
  });

  socket.on("ready", function (roomName) {
    console.log("Ready");
    socket.broadcast.to(roomName).emit("ready");
  });

  socket.on("candidate", function (candidate, roomName) {
    // console.log("candidate", candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate);
  });

  socket.on("offer", function (offer, roomName) {
    // console.log("offer", offer);
    socket.broadcast.to(roomName).emit("offer", offer);
  });

  socket.on("answer", function (answer, roomName) {
    // console.log("answer", answer);
    socket.broadcast.to(roomName).emit("answer", answer);
  });

  socket.on("leave", function (roomName) {
    // console.log("leave");
    socket.leave(roomName);
    socket.broadcast.to(roomName).emit("leave");
  });
});
