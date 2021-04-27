const express = require("express");
const app = express();

const server = require("http").createServer(app);
const socketHandler = require("./socket-handler");
const options = {
  /* ... */
};
const io = require("socket.io")(server, options);

io.on("connection", (socket) => {
  socketHandler(socket);
  console.log(socket.id, socket.rooms);
});

server.listen(7000);
