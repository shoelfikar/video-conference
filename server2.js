// Install dependencies: express, socket.io
// Command: npm install express socket.io

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require("uuid");

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = new Set();


const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// Serve the frontend
app.use(express.static('views')); // Assuming your frontend files are in the 'public' directory
// Set the view engine to Handlebars
app.set("view engine", "hbs");


// Handle socket.io connections
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.render("index", {title: "Video Conference", roomId: uuidv4()})
});

app.get("/:room", (req, res) => {
  res.render("rooms", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log("join-room ", roomId, userId)
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      console.log(message)
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("left-room", (roomId, id, message)=> {
      console.log(roomId, id, message)
    })

    socket.on("disconnecting", () => {
      // socket.leave()
      console.log(socket.rooms.entries()); // the Set contains at least the socket ID
    });
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
